import { NextResponse } from 'next/server';
import { generateAndSaveArticle } from '@/lib/auto-generator';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const identifier = session.user?.email || getClientIp(request);
        const rateLimitResult = rateLimit(identifier, RATE_LIMITS.GENERATE);

        if (!rateLimitResult.success) {
            return NextResponse.json({
                error: 'Too many requests. Please try again later.',
                limit: rateLimitResult.limit,
                remaining: rateLimitResult.remaining,
                reset: rateLimitResult.reset
            }, { 
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': rateLimitResult.reset.toString()
                }
            });
        }

        const article = await generateAndSaveArticle();
        return NextResponse.json({
            success: true,
            article: {
                id: article.id,
                title: article.title,
                summary: article.summary,
                source: article.source
            }
        });
    } catch (error) {
        console.error('Generate error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        return NextResponse.json({
            success: false,
            error: errorMessage,
            errorDetails: errorStack || undefined
        }, { status: 500 });
    }
}
