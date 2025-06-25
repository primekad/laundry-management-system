import { NextRequest, NextResponse } from 'next/server';
import { getRecentOrders } from '@/lib/data/dashboard';
import { auth } from '@/lib/auth';
import { Branch } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  if (!branchId) {
    return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
  }

  const assignedBranches: Branch[] = session.user.assignedBranches ? JSON.parse(session.user.assignedBranches) : [];
  const userBranches = assignedBranches.map(b => b.id);
  if (session.user.defaultBranchId) {
    userBranches.push(session.user.defaultBranchId);
  }

  const userHasAccess = userBranches.includes(branchId);

  if (!userHasAccess && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const recentOrders = await getRecentOrders(branchId);
    return NextResponse.json(recentOrders);
  } catch (error) {
    console.error('Failed to fetch recent orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
