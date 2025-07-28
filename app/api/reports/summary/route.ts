import { NextRequest, NextResponse } from 'next/server';
import { getRevenueSummary } from '@/lib/data/reports';
import { auth } from '@/lib/auth';
import { Branch } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: request.headers,
  });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');
  const period = searchParams.get('period') || 'this-month';

  if (!branchId) {
    return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
  }

  const assignedBranches: Branch[] = session.user.assignedBranches ? JSON.parse(session.user.assignedBranches) : [];
  const userBranches = assignedBranches.map(b => b.id);
  const defaultBranch: Branch | null = session.user.defaultBranch ? JSON.parse(session.user.defaultBranch) : null;
  if (defaultBranch) {
    userBranches.push(defaultBranch.id);
  }

  // Allow 'all' as a special value for branchId, or check access for specific branch
  const userHasAccess = branchId === 'all' || userBranches.includes(branchId);

  if (!userHasAccess && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await getRevenueSummary(branchId, period as string);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch report summary data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
