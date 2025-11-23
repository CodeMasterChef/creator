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

        const { id, isPublished } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        // Update article publish status
        await prisma.article.update({
            where: { id },
            data: { 
                isPublished,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error toggling publish status:', error);
        return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
    }
}
