import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const identifier = session.user?.email || getClientIp(request);
        const limiter = rateLimit(identifier, RATE_LIMITS.API_WRITE);
        if (!limiter.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { title, slug, content, image, tags, isPublished } = await request.json();

        if (!title || !slug || !content || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate summary from content (first 200 chars without HTML)
        const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const summary = cleanContent.substring(0, 200) + '...';

        const article = await prisma.article.create({
            data: {
                title,
                slug,
                content,
                image,
                tags,
                summary,
                isPublished: Boolean(isPublished),
                author: session.user?.name || session.user?.email || 'Admin',
                date: new Date(),
                source: 'Manual',
                sourceUrl: '',
            }
        });

        return NextResponse.json({ success: true, article });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}
