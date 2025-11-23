import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const skip = (page - 1) * limit;

        const [generationLogs, total, successCount, failedCount] = await Promise.all([
            prisma.generationLog.findMany({
                orderBy: { startedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.generationLog.count(),
            prisma.generationLog.count({ where: { status: 'success' } }),
            prisma.generationLog.count({ where: { status: 'failed' } })
        ]);

        return NextResponse.json({
            logs: generationLogs,
            total,
            successCount,
            failedCount,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching generation logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch generation logs' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';

        if (deleteAll) {
            // Delete all logs
            await prisma.generationLog.deleteMany({});
            return NextResponse.json({ 
                success: true, 
                message: 'Đã xóa tất cả logs' 
            });
        } else if (id) {
            // Delete single log
            await prisma.generationLog.delete({
                where: { id }
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Đã xóa log' 
            });
        } else {
            return NextResponse.json(
                { error: 'Missing id or all parameter' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error deleting generation log:', error);
        return NextResponse.json(
            { error: 'Failed to delete generation log' },
            { status: 500 }
        );
    }
}

