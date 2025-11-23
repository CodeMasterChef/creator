import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const identifier = session.user?.email || getClientIp(request);
        const rateLimitResult = rateLimit(identifier, RATE_LIMITS.API_WRITE);

        if (!rateLimitResult.success) {
            return NextResponse.json({
                error: 'Too many requests'
            }, { status: 429 });
        }

        const { id, title, slug, content, image, tags, isPublished } = await request.json();

        if (!id || !title || !slug || !content || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate summary from content (first 200 chars without HTML)
        const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const summary = cleanContent.substring(0, 200) + '...';

        // Update the article
        await prisma.article.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                image,
                tags,
                summary,
                isPublished,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}
