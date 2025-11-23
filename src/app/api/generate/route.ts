import { NextResponse } from 'next/server';
import { generateAndSaveArticle } from '@/lib/auto-generator';

export async function POST() {
    try {
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
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
