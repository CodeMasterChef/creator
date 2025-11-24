import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const identifier = session.user?.email || getClientIp(request);
        const rateLimitResult = rateLimit(identifier, RATE_LIMITS.API_WRITE);

        if (!rateLimitResult.success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const formData = await request.formData();
        const file = formData.get("image");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "Missing image file" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Limit upload to 5MB
        const MAX_SIZE = 5 * 1024 * 1024;
        if (buffer.byteLength > MAX_SIZE) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
        }

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const originalName = file.name || "upload";
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const ext = path.extname(sanitizedName) || ".jpg";
        const baseName = path.basename(sanitizedName, ext);
        const filename = `${Date.now()}-${baseName}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
        });
    } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
