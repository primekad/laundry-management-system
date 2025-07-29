"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, ShoppingBag, Eye, Edit, Printer, ArrowUpRight, Users, Clock, Download } from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, Bar, BarChart } from "recharts"
import Link from "next/link"
import { format } from "date-fns"
import { useBranch } from "@/components/providers/branch-provider"
import { useQuery } from "@tanstack/react-query"

// Data fetching functions
async function fetchDashboardStats(branchId: string | null) {
  const url = branchId ? `/api/dashboard/stats?branchId=${branchId}` : '/api/dashboard/stats';
  console.log(url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

async function fetchRevenueChartData(branchId: string | null) {
  const url = branchId ? `/api/dashboard/revenue-chart?branchId=${branchId}` : '/api/dashboard/revenue-chart';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue chart data');
  }
  return response.json();
}

async function fetchRecentOrders(branchId: string | null) {
  const url = branchId ? `/api/dashboard/recent-orders?branchId=${branchId}` : '/api/dashboard/recent-orders';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }
  return response.json();
}

async function fetchOrderStatusDistribution(branchId: string | null) {
  const url = branchId ? `/api/dashboard/order-status?branchId=${branchId}` : '/api/dashboard/order-status';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch order status distribution');
  }
  return response.json();
}

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    "PENDING": "bg-red-50 text-red-700 border-red-200",
    "WASHING": "bg-blue-50 text-blue-700 border-blue-200",
    "IRONING": "bg-amber-50 text-amber-700 border-amber-200", 
    "READY": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "COMPLETED": "bg-slate-50 text-slate-700 border-slate-200",
    "DELIVERED": "bg-slate-50 text-slate-700 border-slate-200",
  }
  return <Badge className={cn("font-medium border", variants[status] || "bg-gray-50 text-gray-700 border-gray-200")}>{status}</Badge>
}

export default function DashboardPage() {
  const { activeBranch, isAllBranches, setActiveBranch } = useBranch();
  
  // Use either the branch ID or null for "all branches" option
  const branchId = isAllBranches ? "all" : (activeBranch?.id || null);

  // Fetch dashboard data using TanStack Query
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats', branchId],
    queryFn: () => fetchDashboardStats(branchId),
    enabled: !!activeBranch,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['revenueChart', branchId],
    queryFn: () => fetchRevenueChartData(branchId),
    enabled: !!activeBranch,
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['recentOrders', branchId],
    queryFn: () => fetchRecentOrders(branchId),
    enabled: !!activeBranch,
  });
  
  const { data: orderStatusData, isLoading: isLoadingOrderStatus } = useQuery({
    queryKey: ['orderStatusDistribution', branchId],
    queryFn: () => fetchOrderStatusDistribution(branchId),
    enabled: !!activeBranch,
  });

  // Loading state
  if (isLoadingStats || isLoadingChart || isLoadingOrders || isLoadingOrderStatus) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg">
            Welcome back! {isAllBranches ? 'Viewing all branches.' : `Viewing: ${activeBranch?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-2">
            <Button 
              variant={isAllBranches ? "default" : "outline"}
              onClick={() => setActiveBranch('all')}
              className="mr-2"
            >
              All Branches
            </Button>
            {activeBranch && !isAllBranches && (
              <Badge variant="outline" className="text-lg">
                Branch: {activeBranch.name}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="lg" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
            <Link href="/orders/new-standardized">
              <ShoppingBag className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Weekly Revenue"
          value={`₵${stats?.weeklyRevenue?.toFixed(2) || '0.00'}`}
          change={{ 
            value: `${stats?.revenueChangePercentage || 0}% from last week`, 
            trend: stats?.revenueTrend || "neutral"
          }}
          icon={DollarSign}
          gradient="from-emerald-500 to-emerald-600"
        />
        <MetricCard
          title="Weekly Orders"
          value={stats?.weeklyOrders || '0'}
          change={{ 
            value: `${stats?.ordersChangePercentage || 0}% from last week`, 
            trend: stats?.ordersTrend || "neutral"
          }}
          icon={ShoppingBag}
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="New Clients"
          value={stats?.newClients || '0'}
          change={{ 
            value: `${stats?.clientsChangePercentage || 0}% from last week`, 
            trend: stats?.clientsTrend || "neutral" 
          }}
          icon={Users}
          gradient="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Avg. Processing Time"
          value={`${stats?.avgProcessingTime || '0'} hrs`}
          change={{ 
            value: `${stats?.processingTimeChangePercentage || 0}% from last week`, 
            trend: stats?.processingTimeTrend === 'up' ? 'down' : 'up' // Inverse for processing time
          }}
          icon={Clock}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Revenue Overview</CardTitle>
              <p className="text-slate-600 mt-1">Last 7 days performance</p>
            </div>
            <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any) => [`₵${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-slate-900">Order Status</CardTitle>
            <p className="text-slate-600 mt-1">Current distribution</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={orderStatusData} layout="horizontal">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Recent Orders</CardTitle>
            <p className="text-slate-600 mt-1">Latest customer orders requiring attention</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            asChild
          >
            <Link href="/orders">
              View All Orders
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-slate-700">Invoice #</TableHead>
                <TableHead className="font-bold text-slate-700">Customer</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700">Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Date</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders && recentOrders.map((order: any) => (
                <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-bold text-slate-900">{order.invoiceNumber || `ORD-${order.id}`}</TableCell>
                  <TableCell className="font-medium text-slate-900">{order.customer.name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="font-bold text-slate-900">₵{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-600">{format(new Date(order.createdAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" asChild>
                        <Link href={`/orders/${order.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
