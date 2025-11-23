import cron from 'node-cron';
import { generateAndSaveArticle } from './auto-generator';

let isSchedulerRunning = false;

export function startAutoGeneration() {
    if (isSchedulerRunning) {
        console.log('⚠️ Scheduler already running');
        return;
    }

    // Run every 2 hours
    cron.schedule('0 */2 * * *', async () => {
        console.log('🤖 Auto-generating article...');
        try {
            await generateAndSaveArticle();
        } catch (error) {
            console.error('❌ Auto-generation failed:', error);
        }
    });

    // Also run immediately on startup
    generateAndSaveArticle().catch(console.error);

    isSchedulerRunning = true;
    console.log('✅ Auto-generation scheduler started (every 2 hours)');
}
