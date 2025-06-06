"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Printer, MessageSquare, Plus, Search } from "lucide-react"

const orders = [
  {
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

export default function OrdersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "destructive",
      Washing: "default",
      Ironing: "default",
      Ready: "secondary",
      Delivered: "outline",
      Cancelled: "destructive",
    }
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const variants = {
      Unpaid: "destructive",
      "Partially Paid": "default",
      Paid: "secondary",
    }
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Orders</h1>
          <p className="text-muted-foreground">Manage and track all laundry orders</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter orders by status, payment, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="washing">Washing</SelectItem>
                <SelectItem value="ironing">Ironing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.invoice}>
                  <TableCell className="font-medium">{order.invoice}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.deliveryDate}</TableCell>
                  <TableCell>₵{order.total.toFixed(2)}</TableCell>
                  <TableCell>₵{order.paid.toFixed(2)}</TableCell>
                  <TableCell>₵{order.balance.toFixed(2)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
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
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
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
