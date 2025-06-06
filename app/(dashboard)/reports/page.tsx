"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/ui/metric-card"
import { Download, TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts"

const revenueData = [
  { month: "Jan", revenue: 12450, expenses: 3200, profit: 9250, orders: 156 },
  { month: "Feb", revenue: 15200, expenses: 3800, profit: 11400, orders: 189 },
  { month: "Mar", revenue: 13800, expenses: 3500, profit: 10300, orders: 167 },
  { month: "Apr", revenue: 16500, expenses: 4200, profit: 12300, orders: 203 },
  { month: "May", revenue: 14200, expenses: 3900, profit: 10300, orders: 178 },
  { month: "Jun", revenue: 18900, expenses: 4500, profit: 14400, orders: 234 },
]

const ordersByStatus = [
  { status: "Delivered", count: 145, percentage: 70 },
  { status: "Ready", count: 23, percentage: 11 },
  { status: "Ironing", count: 18, percentage: 9 },
  { status: "Washing", count: 12, percentage: 6 },
  { status: "Pending", count: 8, percentage: 4 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Business analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-48 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="₵18,900"
          change={{ value: "+14.5% from last month", trend: "up" }}
          icon={DollarSign}
          gradient="from-emerald-500 to-emerald-600"
        />
        <MetricCard
          title="Total Orders"
          value="234"
          change={{ value: "+8.2% from last month", trend: "up" }}
          icon={ShoppingBag}
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="New Customers"
          value="47"
          change={{ value: "+12% from last month", trend: "up" }}
          icon={Users}
          gradient="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Net Profit"
          value="₵14,400"
          change={{ value: "+18.2% from last month", trend: "up" }}
          icon={TrendingUp}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses Chart */}
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Revenue vs Expenses</CardTitle>
              <p className="text-slate-600 mt-1">Monthly comparison over the last 6 months</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Orders by Status</CardTitle>
              <p className="text-slate-600 mt-1">Current order distribution</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByStatus} layout="horizontal">
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

      {/* Profit Trend */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Profit Trend</CardTitle>
            <p className="text-slate-600 mt-1">Monthly profit over the last 6 months</p>
          </div>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={3} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
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
            >
              <Download className="h-6 w-6 mb-2" />
              Revenue Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-6 w-6 mb-2" />
              Orders Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-6 w-6 mb-2" />
              Expenses Report
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
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
