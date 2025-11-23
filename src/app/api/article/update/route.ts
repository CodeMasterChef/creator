import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
