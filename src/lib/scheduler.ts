import cron from 'node-cron';
import { generateAndSaveArticle } from './auto-generator';
import { generateMultipleArticles } from './batch-generator';
import { prisma } from './prisma';

let isSchedulerRunning = false;
let currentCronJob: cron.ScheduledTask | null = null;

async function getSettings(): Promise<{ enabled: boolean; intervalMinutes: number }> {
    try {
        let settings = await prisma.systemSettings.findFirst();
        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.systemSettings.create({
                data: { 
                    autoGenerationEnabled: true,
                    generationInterval: 120 
                }
            });
        }
        return {
            enabled: settings.autoGenerationEnabled,
            intervalMinutes: settings.generationInterval
        };
    } catch (error) {
        console.error('Error fetching settings, using defaults:', error);
        return { enabled: true, intervalMinutes: 120 };
    }
}

function getCronExpression(minutes: number): string {
    if (minutes >= 60 && minutes % 60 === 0) {
        // If it's hours, use hourly cron
        const hours = minutes / 60;
        return `0 */${hours} * * *`;
    } else if (minutes < 60) {
        // If less than 60 minutes, use minute-based cron
        return `*/${minutes} * * * *`;
    } else {
        // For mixed (e.g., 90 minutes), we'll use minute-based cron
        return `*/${minutes} * * * *`;
    }
}

async function shouldRunInitialBatch(): Promise<boolean> {
    try {
        const { enabled, intervalMinutes } = await getSettings();
        
        // Don't run if auto-generation is disabled
        if (!enabled) {
            return false;
        }
        
        // Check if we generated articles recently (within the last interval)
        const recentLog = await prisma.generationLog.findFirst({
            orderBy: { startedAt: 'desc' },
            where: {
                startedAt: {
                    gte: new Date(Date.now() - intervalMinutes * 60 * 1000)
                }
            }
        });
        
        return !recentLog; // Only run if no recent generation
    } catch (error) {
        console.error('Error checking recent generation:', error);
        return false; // Don't run if we can't check
    }
}

export async function startAutoGeneration() {
    if (isSchedulerRunning) {
        console.log('⚠️ Scheduler already running');
        return;
    }

    const { enabled, intervalMinutes } = await getSettings();
    
    if (!enabled) {
        console.log('⏸️ Auto-generation is DISABLED. Scheduler not started.');
        return;
    }

    const cronExpression = getCronExpression(intervalMinutes);

    console.log(`📅 Setting up scheduler with interval: ${intervalMinutes} minutes`);
    console.log(`📅 Cron expression: ${cronExpression}`);

    // Schedule based on configured interval
    currentCronJob = cron.schedule(cronExpression, async () => {
        // Check if still enabled before running
        const currentSettings = await getSettings();
        if (!currentSettings.enabled) {
            console.log('⏸️ Auto-generation disabled, skipping scheduled run');
            return;
        }
        
        console.log('🤖 Auto-generating articles (batch of 3)...');
        try {
            await generateMultipleArticles(3);
        } catch (error) {
            console.error('❌ Auto-generation failed:', error);
        }
    });

    // Check if should run initial batch (prevent running on every hot-reload)
    const runInitialBatch = await shouldRunInitialBatch();
    if (runInitialBatch) {
        console.log('🚀 Starting initial batch generation (no recent generation found)...');
        generateMultipleArticles(2).catch(console.error);
    } else {
        console.log('⏭️ Skipping initial batch (already generated recently)');
    }

    isSchedulerRunning = true;
    console.log(`✅ Auto-generation scheduler started (3 articles every ${intervalMinutes} minutes)`);
}

export async function stopScheduler() {
    if (currentCronJob) {
        currentCronJob.stop();
        currentCronJob = null;
    }
    isSchedulerRunning = false;
    console.log('⏹️ Scheduler stopped');
}

export async function restartScheduler() {
    await stopScheduler();
    console.log('🔄 Restarting scheduler with new settings...');
    await startAutoGeneration();
}

export function getSchedulerStatus(): boolean {
    return isSchedulerRunning;
}
