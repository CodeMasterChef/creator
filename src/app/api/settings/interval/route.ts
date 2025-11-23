import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { restartScheduler } from '@/lib/scheduler';

export async function GET() {
  try {
    // Get or create default settings
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          generationInterval: 120, // default 2 hours
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      intervalMinutes: settings.generationInterval 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch settings',
      intervalMinutes: 120 // fallback default
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { intervalMinutes } = await request.json();

    if (!intervalMinutes || intervalMinutes < 1) {
      return NextResponse.json({ 
        message: 'Invalid interval value' 
      }, { status: 400 });
    }

    // Update or create settings
    const settings = await prisma.systemSettings.findFirst();
    
    if (settings) {
      await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { generationInterval: intervalMinutes }
      });
    } else {
      await prisma.systemSettings.create({
        data: { generationInterval: intervalMinutes }
      });
    }

    // Restart scheduler with new interval
    try {
      await restartScheduler();
      console.log('✅ Scheduler restarted with new interval:', intervalMinutes);
    } catch (error) {
      console.error('⚠️ Failed to restart scheduler:', error);
      // Continue anyway, it will pick up the new setting on next server restart
    }

    return NextResponse.json({ 
      success: true, 
      intervalMinutes 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update settings' 
    }, { status: 500 });
  }
}

