"use client"

import { useBranch } from '@/components/providers/branch-provider';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, ShoppingBag, AlertCircle, TrendingUp, Eye, Edit, Printer } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { AuthGuard } from '@/components/auth/auth-guard';
import { format } from 'date-fns';



const pendingTasks = [
  { invoice: "INV-2025-001", customer: "Sarah Johnson", task: "Ready for Pickup", priority: "high" },
  { invoice: "INV-2025-006", customer: "David Miller", task: "Payment Due", priority: "medium" },
  { invoice: "INV-2025-007", customer: "Anna Taylor", task: "Special Instructions", priority: "low" },
]

async function fetchDashboardStats(branchId: string) {
  const response = await fetch(`/api/dashboard/stats?branchId=${branchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

async function fetchRevenueChartData(branchId: string) {
  const response = await fetch(`/api/dashboard/revenue-chart?branchId=${branchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue chart data');
  }
  return response.json();
}

async function fetchRecentOrders(branchId: string) {
  const response = await fetch(`/api/dashboard/recent-orders?branchId=${branchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }
  return response.json();
}

async function fetchRecentExpenses(branchId: string) {
  const response = await fetch(`/api/dashboard/recent-expenses?branchId=${branchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recent expenses');
  }
  return response.json();
}

export default function Dashboard() {
  const { activeBranch } = useBranch();

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardStats', activeBranch?.id],
    queryFn: () => fetchDashboardStats(activeBranch!.id),
    enabled: !!activeBranch,
  });

  const { data: chartData, isLoading: isLoadingChart, error: chartError } = useQuery({
    queryKey: ['revenueChart', activeBranch?.id],
    queryFn: () => fetchRevenueChartData(activeBranch!.id),
    enabled: !!activeBranch,
  });

  const { data: recentOrders, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['recentOrders', activeBranch?.id],
    queryFn: () => fetchRecentOrders(activeBranch!.id),
    enabled: !!activeBranch,
  });

  const { data: recentExpenses, isLoading: isLoadingExpenses, error: expensesError } = useQuery({
    queryKey: ['recentExpenses', activeBranch?.id],
    queryFn: () => fetchRecentExpenses(activeBranch!.id),
    enabled: !!activeBranch,
  });

  if ((isLoadingStats || isLoadingChart || isLoadingOrders || isLoadingExpenses) && !stats) {
    return <div>Loading dashboard...</div>;
  }

  if (statsError || chartError || ordersError || expensesError) {
    return <div>Error loading dashboard data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {activeBranch && (
          <Badge variant="outline" className="text-lg">
            Viewing: {activeBranch.name}
          </Badge>
        )}
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AuthGuard role="admin">
          <Card className="bg-primary/10 border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Controls</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button size="sm">Go to Admin Panel</Button>
            </CardContent>
          </Card>
        </AuthGuard>

        <AuthGuard permission={{ report: ['view'] }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{stats?.totalRevenue.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </AuthGuard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ordersThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">+8 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats?.outstandingPayments.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">12 pending orders</p>
          </CardContent>
        </Card>

        <AuthGuard permission={{ expense: ['list'] }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{stats?.expensesThisMonth.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </AuthGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <AuthGuard permission={{ report: ['view'] }}>
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoadingChart ? (
                <div>Loading chart data...</div>
              ) : chartError ? (
                <div>Error loading chart data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value}`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </AuthGuard>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.customer}</p>
                    <p className="text-xs text-muted-foreground">{task.invoice}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.task}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Expenses */}
      <div className="grid gap-6 md:grid-cols-2">
        <AuthGuard permission={{ order: ['list'] }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div>Loading recent orders...</div>
              ) : ordersError ? (
                <div>Error loading recent orders.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell>₵{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </AuthGuard>

        <AuthGuard permission={{ expense: ['list'] }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingExpenses ? (
                <div>Loading recent expenses...</div>
              ) : expensesError ? (
                <div>Error loading recent expenses.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExpenses.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>₵{expense.amount.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(expense.createdAt), 'dd/MM/yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </AuthGuard>
      </div>
    </div>
  )
}
