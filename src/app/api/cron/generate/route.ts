import { NextResponse } from 'next/server';
import { generateMultipleArticles } from '@/lib/batch-generator';

/**
 * Cron endpoint for automatic article generation
 * Called by Vercel Cron every 2 hours
 */
export async function GET(request: Request) {
    try {
        // Verify the request is from Vercel Cron
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🤖 Cron job: Starting batch generation...');
        
        // Generate 3 articles
        const results = await generateMultipleArticles(3);
        
        return NextResponse.json({
            success: true,
            message: `Generated ${results.success} articles`,
            results
        });
    } catch (error: any) {
        console.error('❌ Cron job failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}





