import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { restartScheduler, stopScheduler } from '@/lib/scheduler';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { enabled } = body;

        if (typeof enabled !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid input: enabled must be a boolean' },
                { status: 400 }
            );
        }

        // Get or create settings
        let settings = await prisma.systemSettings.findFirst();
        
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    autoGenerationEnabled: enabled,
                    generationInterval: 120
                }
            });
        } else {
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: { autoGenerationEnabled: enabled }
            });
        }

        // Restart or stop scheduler based on new setting
        if (enabled) {
            console.log('🔄 Restarting scheduler after enabling auto-generation...');
            await restartScheduler();
        } else {
            console.log('⏹️ Stopping scheduler after disabling auto-generation...');
            await stopScheduler();
        }

        return NextResponse.json({
            success: true,
            enabled: settings.autoGenerationEnabled,
            message: enabled 
                ? 'Auto-generation enabled and scheduler restarted' 
                : 'Auto-generation disabled and scheduler stopped'
        });

    } catch (error) {
        console.error('Error toggling auto-generation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

