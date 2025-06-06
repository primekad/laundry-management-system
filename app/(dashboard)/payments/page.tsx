"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, CreditCard, Clock, TrendingUp, Search, Plus, Eye, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

const payments = [
  {
    id: "1",
    invoice: "INV-2025-001",
    customer: "Sarah Johnson",
    amount: 85.0,
    method: "Mobile Money",
    status: "Completed",
    date: "2025-01-15",
    time: "10:30 AM",
  },
  {
    id: "2",
    invoice: "INV-2025-002",
    customer: "Michael Chen",
    amount: 50.0,
    method: "Cash",
    status: "Completed",
    date: "2025-01-15",
    time: "11:45 AM",
  },
  {
    id: "3",
    invoice: "INV-2025-003",
    customer: "Emma Davis",
    amount: 95.0,
    method: "Card",
    status: "Pending",
    date: "2025-01-14",
    time: "2:15 PM",
  },
]

export default function PaymentsPage() {
  const getStatusBadge = (status: string) => {
    const variants = {
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Failed: "bg-red-50 text-red-700 border-red-200",
    }
    return <Badge className={cn("font-medium border", variants[status as keyof typeof variants])}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Payments"
          value="₵2,340"
          change={{ value: "+12% from yesterday", trend: "up" }}
          icon={DollarSign}
          gradient="from-emerald-500 to-emerald-600"
        />
        <MetricCard
          title="Pending Payments"
          value="₵850"
          change={{ value: "3 transactions", trend: "neutral" }}
          icon={Clock}
          gradient="from-amber-500 to-amber-600"
        />
        <MetricCard
          title="Payment Methods"
          value="4"
          change={{ value: "Mobile Money leading", trend: "neutral" }}
          icon={CreditCard}
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Success Rate"
          value="98.5%"
          change={{ value: "+0.5% this month", trend: "up" }}
          icon={TrendingUp}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search payments..."
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48 bg-white border-slate-200">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48 bg-white border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Recent Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-slate-700">Invoice #</TableHead>
                <TableHead className="font-bold text-slate-700">Customer</TableHead>
                <TableHead className="font-bold text-slate-700">Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Method</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700">Date & Time</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-bold text-slate-900">{payment.invoice}</TableCell>
                  <TableCell className="font-medium text-slate-900">{payment.customer}</TableCell>
                  <TableCell className="font-bold text-slate-900">₵{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.date}</div>
                      <div className="text-sm text-slate-500">{payment.time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                        <Edit className="h-4 w-4" />
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
