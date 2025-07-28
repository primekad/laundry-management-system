import { NextRequest, NextResponse } from 'next/server';
import { generateReportCSV } from '@/lib/data/reports';
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
  const reportType = searchParams.get('type') as 'revenue' | 'orders' | 'expenses' | 'customers';
  const period = searchParams.get('period') || 'this-month';

  if (!branchId || !reportType) {
    return NextResponse.json({ 
      error: 'Branch ID and report type are required' 
    }, { status: 400 });
  }

  const validTypes = ['revenue', 'orders', 'expenses', 'customers'];
  if (!validTypes.includes(reportType)) {
    return NextResponse.json({ 
      error: `Invalid report type. Must be one of: ${validTypes.join(', ')}` 
    }, { status: 400 });
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
    const csvContent = await generateReportCSV(reportType, branchId, period);
    
    // Create a date string for filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `${reportType}-report-${date}.csv`;
    
    // Set headers for CSV download
    const headers = new Headers();
    headers.append('Content-Type', 'text/csv');
    headers.append('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new NextResponse(csvContent, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error(`Failed to generate ${reportType} report CSV:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
