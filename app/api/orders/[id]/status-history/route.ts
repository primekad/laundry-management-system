import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch status history for the order, ordered by most recent first
    const statusHistory = await db.orderStatusHistory.findMany({
      where: {
        orderId: id,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    return NextResponse.json(statusHistory);
  } catch (error) {
    console.error('Error fetching order status history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status history' },
      { status: 500 }
    );
  }
}
