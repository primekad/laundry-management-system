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

const revenueData = [
  { day: "Mon", revenue: 1200, orders: 15 },
  { day: "Tue", revenue: 1800, orders: 22 },
  { day: "Wed", revenue: 1500, orders: 18 },
  { day: "Thu", revenue: 2200, orders: 28 },
  { day: "Fri", revenue: 2800, orders: 35 },
  { day: "Sat", revenue: 3200, orders: 42 },
  { day: "Sun", revenue: 2100, orders: 26 },
]

const orderStatusData = [
  { status: "Pending", count: 8, color: "#dc2626" },
  { status: "Washing", count: 15, color: "#2563eb" },
  { status: "Ironing", count: 12, color: "#d97706" },
  { status: "Ready", count: 23, color: "#059669" },
  { status: "Delivered", count: 145, color: "#64748b" },
]

const recentOrders = [
  { invoice: "INV-2025-001", customer: "Sarah Johnson", status: "Ready", amount: "₵85.00", time: "2 hours ago" },
  { invoice: "INV-2025-002", customer: "Michael Chen", status: "Washing", amount: "₵120.50", time: "4 hours ago" },
  { invoice: "INV-2025-003", customer: "Emma Davis", status: "Ironing", amount: "₵95.00", time: "6 hours ago" },
  { invoice: "INV-2025-004", customer: "James Wilson", status: "Delivered", amount: "₵150.00", time: "1 day ago" },
  { invoice: "INV-2025-005", customer: "Lisa Brown", status: "Pending", amount: "₵75.50", time: "2 days ago" },
]

const getStatusBadge = (status: string) => {
  const variants = {
    Pending: "bg-red-50 text-red-700 border-red-200",
    Washing: "bg-blue-50 text-blue-700 border-blue-200",
    Ironing: "bg-amber-50 text-amber-700 border-amber-200",
    Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Delivered: "bg-slate-50 text-slate-700 border-slate-200",
  }
  return <Badge className={cn("font-medium border", variants[status as keyof typeof variants])}>{status}</Badge>
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
            <Link href="/orders/new">
              <ShoppingBag className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Revenue"
          value="₵3,200"
          change={{ value: "+35% from yesterday", trend: "up" }}
          icon={DollarSign}
          gradient="from-emerald-500 to-emerald-600"
        />
        <MetricCard
          title="Today's Orders"
          value="42"
          change={{ value: "+8% from yesterday", trend: "up" }}
          icon={ShoppingBag}
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="New Clients"
          value="8"
          change={{ value: "-14% from yesterday", trend: "down" }}
          icon={Users}
          gradient="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Avg. Processing Time"
          value="2.4 hrs"
          change={{ value: "-12% improvement", trend: "up" }}
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
              <AreaChart data={revenueData}>
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
                <TableHead className="font-bold text-slate-700">Time</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.invoice} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-bold text-slate-900">{order.invoice}</TableCell>
                  <TableCell className="font-medium text-slate-900">{order.customer}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="font-bold text-slate-900">{order.amount}</TableCell>
                  <TableCell className="text-slate-600">{order.time}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <Edit className="h-4 w-4" />
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
  )
}
