"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowUp, Download, Loader2, TrendingUp, Users } from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { useBranch } from "@/components/providers/branch-provider"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

// Skeleton loader component for charts
const ChartSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
    <div className="h-64 w-full bg-slate-100 rounded-md"></div>
  </div>
);

// Skeleton loader component for metric cards
const MetricCardSkeleton = () => (
  <div className="rounded-lg p-6 animate-pulse space-y-3 bg-white border border-slate-100 shadow-md">
    <div className="flex justify-between items-center">
      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 w-8 rounded-full bg-slate-200"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mt-2"></div>
    <div className="h-4 bg-slate-100 rounded w-1/4 mt-1"></div>
  </div>
)

// Data fetching functions
async function fetchRevenueExpensesData(branchId: string | null, period: string) {
  const url = branchId 
    ? `/api/reports/revenue-expenses?branchId=${branchId}&period=${period}` 
    : `/api/reports/revenue-expenses?period=${period}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue-expenses data');
  }
  return response.json();
}

async function fetchOrdersByStatus(branchId: string | null, period: string) {
  const url = branchId 
    ? `/api/reports/orders-by-status?branchId=${branchId}&period=${period}` 
    : `/api/reports/orders-by-status?period=${period}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch orders by status data');
  }
  return response.json();
}

async function fetchProfitTrend(branchId: string | null, period: string) {
  const url = branchId 
    ? `/api/reports/profit-trend?branchId=${branchId}&period=${period}` 
    : `/api/reports/profit-trend?period=${period}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch profit trend data');
  }
  return response.json();
}

async function fetchReportSummary(branchId: string | null, period: string) {
  const url = branchId 
    ? `/api/reports/summary?branchId=${branchId}&period=${period}` 
    : `/api/reports/summary?period=${period}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch report summary data');
  }
  return response.json();
}

// Function to format currency
const formatCurrency = (value: number) => {
  return `₵${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Function to download a report
const downloadReport = (type: 'revenue' | 'orders' | 'expenses' | 'customers', branchId: string, period: string) => {
  const url = `/api/reports/export?type=${type}&branchId=${branchId}&period=${period}`;
  window.open(url, '_blank');
};

export default function ReportsPage() {
  const { activeBranch, isAllBranches } = useBranch();
  const [isBranchLoading, setBranchLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this-month");
  
  // Use either the branch ID or "all" for "all branches" option
  const branchId = isAllBranches ? "all" : (activeBranch?.id || null);

  // Fetch data using TanStack Query
  const { data: revenueExpensesData, isLoading: isLoadingRevenueExpenses } = useQuery({
    queryKey: ['revenue-expenses', branchId, selectedPeriod],
    queryFn: () => fetchRevenueExpensesData(branchId, selectedPeriod),
    enabled: branchId !== undefined,
  });

  const { data: ordersByStatusData, isLoading: isLoadingOrderStatus } = useQuery({
    queryKey: ['ordersByStatusData', branchId, selectedPeriod],
    queryFn: () => fetchOrdersByStatus(branchId, selectedPeriod),
    enabled: !isBranchLoading && !!branchId,
  });

  const { data: profitTrendData, isLoading: isLoadingProfitTrend } = useQuery({
    queryKey: ['profitTrendData', branchId, selectedPeriod],
    queryFn: () => fetchProfitTrend(branchId, selectedPeriod),
    enabled: !isBranchLoading && !!branchId,
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['report-summary', branchId, selectedPeriod],
    queryFn: () => fetchReportSummary(branchId, selectedPeriod),
    enabled: branchId !== undefined,
  });

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };
  
  // Initialize loading state for branch context
  useEffect(() => {
    if (activeBranch || isAllBranches) {
      setBranchLoading(false);
    }
  }, [activeBranch, isAllBranches]);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Business analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => {
              // Download all report types
              downloadReport('revenue', branchId || 'all', selectedPeriod);
              downloadReport('orders', branchId || 'all', selectedPeriod);
              downloadReport('expenses', branchId || 'all', selectedPeriod);
              downloadReport('customers', branchId || 'all', selectedPeriod);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {isLoadingSummary ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Revenue"
              value={summaryData?.totalRevenue !== undefined ? formatCurrency(summaryData.totalRevenue) : "₵0"}
              change={{ 
                value: `${summaryData?.revenueChange >= 0 ? '+' : ''}${summaryData?.revenueChange}% from last period`, 
                trend: summaryData?.revenueTrend || "up"
              }}
              icon={TrendingUp}
              gradient="from-green-500 to-green-600"
            />
            <MetricCard
              title="Total Orders"
              value={summaryData?.totalOrders !== undefined ? summaryData.totalOrders.toString() : "0"}
              change={{ 
                value: `${summaryData?.ordersChange >= 0 ? '+' : ''}${summaryData?.ordersChange}% from last period`,
                trend: summaryData?.ordersTrend || "up" 
              }}
              icon={Users}
              gradient="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="New Customers"
              value={summaryData?.newCustomers !== undefined ? summaryData.newCustomers.toString() : "0"}
              change={{ 
                value: `${summaryData?.customersChange >= 0 ? '+' : ''}${summaryData?.customersChange}% from last period`,
                trend: summaryData?.customersTrend || "up" 
              }}
              icon={Users}
              gradient="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Net Profit"
              value={summaryData?.netProfit !== undefined ? formatCurrency(summaryData.netProfit) : "₵0"}
              change={{ 
                value: `${summaryData?.profitChange >= 0 ? '+' : ''}${summaryData?.profitChange}% from last period`,
                trend: summaryData?.profitTrend || "up" 
              }}
              icon={TrendingUp}
              gradient="from-amber-500 to-amber-600"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses Report */}
        <Card className="col-span-1 h-[400px]">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg">Revenue vs Expenses</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('revenue', branchId || 'all', selectedPeriod)}
              disabled={isLoadingRevenueExpenses}
            >
              {isLoadingRevenueExpenses ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingRevenueExpenses ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={revenueExpensesData || []}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₵${value}`} />
                  <Tooltip formatter={(value) => `₵${value}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Orders by Status</CardTitle>
              <p className="text-slate-600 mt-1">Current order distribution</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('orders', branchId || 'all', selectedPeriod)}
              disabled={isLoadingOrderStatus}
            >
              {isLoadingOrderStatus ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingOrderStatus ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ordersByStatusData || []} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Profit Trend</CardTitle>
            <p className="text-slate-600 mt-1">Monthly profit over the last 6 months</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => downloadReport('revenue', branchId || 'all', selectedPeriod)}
            disabled={isLoadingProfitTrend}
          >
            {isLoadingProfitTrend ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingProfitTrend ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitTrendData || []}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="profit" stroke="#4f46e5" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Export Reports</CardTitle>
          <p className="text-slate-600 mt-1">Download detailed reports for external analysis</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('revenue', branchId || 'all', selectedPeriod)}
            >
              <Download className="h-6 w-6 mb-2" />
              Revenue Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('orders', branchId || 'all', selectedPeriod)}
            >
              <Download className="h-6 w-6 mb-2" />
              Orders Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('expenses', branchId || 'all', selectedPeriod)}
            >
              <Download className="h-6 w-6 mb-2" />
              Expenses Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => downloadReport('customers', branchId || 'all', selectedPeriod)}
            >
              <Download className="h-6 w-6 mb-2" />
              Customer Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
