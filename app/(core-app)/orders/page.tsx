"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Printer, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const orders = [
  {
    id: "1",
    invoice: "INV-2025-001",
    customer: "Sarah Johnson",
    phone: "0244123456",
    orderDate: "2025-01-15",
    deliveryDate: "2025-01-17",
    total: 85.0,
    paid: 85.0,
    balance: 0.0,
    paymentStatus: "Paid",
    orderStatus: "Ready",
  },
  {
    id: "2",
    invoice: "INV-2025-002",
    customer: "Michael Chen",
    phone: "0244789012",
    orderDate: "2025-01-15",
    deliveryDate: "2025-01-18",
    total: 120.5,
    paid: 50.0,
    balance: 70.5,
    paymentStatus: "Partially Paid",
    orderStatus: "Washing",
  },
  {
    id: "3",
    invoice: "INV-2025-003",
    customer: "Emma Davis",
    phone: "0244345678",
    orderDate: "2025-01-14",
    deliveryDate: "2025-01-16",
    total: 95.0,
    paid: 0.0,
    balance: 95.0,
    paymentStatus: "Unpaid",
    orderStatus: "Ironing",
  },
  {
    id: "4",
    invoice: "INV-2025-004",
    customer: "James Wilson",
    phone: "0244901234",
    orderDate: "2025-01-13",
    deliveryDate: "2025-01-15",
    total: 150.0,
    paid: 150.0,
    balance: 0.0,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
  },
  {
    id: "5",
    invoice: "INV-2025-005",
    customer: "Lisa Brown",
    phone: "0244567890",
    orderDate: "2025-01-15",
    deliveryDate: "2025-01-19",
    total: 75.5,
    paid: 0.0,
    balance: 75.5,
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "bg-red-100 text-red-700",
      Washing: "bg-blue-100 text-blue-700",
      Ironing: "bg-yellow-100 text-yellow-700",
      Ready: "bg-green-100 text-green-700",
      Delivered: "bg-gray-100 text-gray-700",
    }
    return <Badge className={cn("border-0 font-medium", variants[status as keyof typeof variants])}>{status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const variants = {
      Unpaid: "bg-red-100 text-red-700",
      "Partially Paid": "bg-yellow-100 text-yellow-700",
      Paid: "bg-green-100 text-green-700",
    }
    return <Badge className={cn("border-0 font-medium", variants[status as keyof typeof variants])}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600 mt-1">Manage and track all laundry orders</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48 bg-white border-slate-200">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="washing">Washing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48 bg-white border-slate-200">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">Invoice #</TableHead>
                <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                <TableHead className="font-semibold text-slate-700">Order Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Total</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{order.invoice}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{order.customer}</div>
                      <div className="text-sm text-slate-500">{order.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{order.orderDate}</TableCell>
                  <TableCell className="font-semibold text-slate-900">₵{order.total.toFixed(2)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
                        asChild
                      >
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
                        asChild
                      >
                        <Link href={`/orders/${order.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
                      >
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
