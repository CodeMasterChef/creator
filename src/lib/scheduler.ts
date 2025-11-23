import cron from 'node-cron';
import { generateAndSaveArticle } from './auto-generator';
import { generateMultipleArticles } from './batch-generator';

let isSchedulerRunning = false;

export function startAutoGeneration() {
    if (isSchedulerRunning) {
        console.log('⚠️ Scheduler already running');
        return;
    }

    // Run every 2 hours - generate 3 articles at a time
    cron.schedule('0 */2 * * *', async () => {
        console.log('🤖 Auto-generating articles (batch of 3)...');
        try {
            await generateMultipleArticles(3);
        } catch (error) {
            console.error('❌ Auto-generation failed:', error);
        }
    });

    // Also run immediately on startup (generate 2 articles)
    console.log('🚀 Starting initial batch generation...');
    generateMultipleArticles(2).catch(console.error);

    isSchedulerRunning = true;
    console.log('✅ Auto-generation scheduler started (3 articles every 2 hours)');
}
