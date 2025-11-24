import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function requireAuth(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = session.user?.email || getClientIp(request);
    return { session, identifier };
}

export async function GET(request: Request) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { identifier } = authResult;

    const limiter = rateLimit(identifier, RATE_LIMITS.API_READ);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        const files = await fs.readdir(uploadsDir);

        const fileInfos = await Promise.all(
            files.map(async (filename) => {
                const filePath = path.join(uploadsDir, filename);
                const stats = await fs.stat(filePath);
                if (!stats.isFile()) return null;
                return {
                    filename,
                    url: `/uploads/${filename}`,
                    size: stats.size,
                    createdAt: stats.birthtimeMs || stats.mtimeMs,
                };
            })
        );

        return NextResponse.json({
            files: fileInfos.filter(Boolean),
        });
    } catch (error) {
        console.error("Failed to list uploads:", error);
        return NextResponse.json({ error: "Failed to load uploads" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { identifier } = authResult;

    const limiter = rateLimit(identifier, RATE_LIMITS.API_WRITE);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const { filename } = await request.json();
        if (!filename || typeof filename !== "string") {
            return NextResponse.json({ error: "Missing filename" }, { status: 400 });
        }

        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        const targetPath = path.join(uploadsDir, filename);
        if (!targetPath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        await fs.unlink(targetPath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete upload:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { identifier } = authResult;

    const limiter = rateLimit(identifier, RATE_LIMITS.API_WRITE);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const { oldFilename, newFilename } = await request.json();
        if (!oldFilename || !newFilename || typeof oldFilename !== "string" || typeof newFilename !== "string") {
            return NextResponse.json({ error: "Missing filenames" }, { status: 400 });
        }

        const sanitizedOld = oldFilename.trim();
        const sanitizedNew = newFilename.trim();

        if (
            [sanitizedOld, sanitizedNew].some(
                (name) => name.includes("..") || name.includes("/") || name.includes("\\")
            )
        ) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        if (!/^[A-Za-z0-9._-]+$/.test(sanitizedNew)) {
            return NextResponse.json({ error: "Tên file chỉ được chứa chữ, số, dấu gạch ngang, gạch dưới hoặc dấu chấm" }, { status: 400 });
        }

        const oldPath = path.join(uploadsDir, sanitizedOld);
        const newPath = path.join(uploadsDir, sanitizedNew);

        try {
            await fs.access(oldPath);
        } catch {
            return NextResponse.json({ error: "File không tồn tại" }, { status: 404 });
        }

        try {
            await fs.access(newPath);
            return NextResponse.json({ error: "Tên file đã tồn tại" }, { status: 400 });
        } catch {
            // New file name is available
        }

        await fs.rename(oldPath, newPath);

        const oldUrlFragment = sanitizedOld;
        const newUrlFragment = sanitizedNew;
        const newUrl = `/uploads/${newUrlFragment}`;

        const impactedArticles = await prisma.article.findMany({
            where: {
                image: {
                    contains: oldUrlFragment,
                },
            },
            select: { id: true, image: true },
        });

        const updatePromises = impactedArticles
            .map((article) => {
                const updatedImage = article.image.replace(oldUrlFragment, newUrlFragment);
                if (updatedImage === article.image) return null;
                return prisma.article.update({
                    where: { id: article.id },
                    data: { image: updatedImage },
                });
            })
            .filter((promise): promise is Promise<unknown> => promise !== null);

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            file: {
                filename: sanitizedNew,
                url: newUrl,
            },
            updatedCount: updatePromises.length,
        });
    } catch (error) {
        console.error("Failed to rename file:", error);
        return NextResponse.json({ error: "Không thể đổi tên file" }, { status: 500 });
    }
}
