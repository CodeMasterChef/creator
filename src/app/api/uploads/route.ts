import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
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
