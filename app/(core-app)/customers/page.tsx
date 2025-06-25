"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Edit, ShoppingBag } from "lucide-react"

const customers = [
  {
    id: "1",
    name: "Sarah Johnson",
    phone: "0244123456",
    email: "sarah@email.com",
    address: "123 Main St, Accra",
    totalOrders: 15,
    totalSpent: 1250.0,
  },
  {
    id: "2",
    name: "Michael Chen",
    phone: "0244789012",
    email: "michael@email.com",
    address: "456 Oak Ave, Kumasi",
    totalOrders: 8,
    totalSpent: 680.5,
  },
  {
    id: "3",
    name: "Emma Davis",
    phone: "0244345678",
    email: "emma@email.com",
    address: "789 Pine Rd, Takoradi",
    totalOrders: 22,
    totalSpent: 1890.0,
  },
  {
    id: "4",
    name: "James Wilson",
    phone: "0244901234",
    email: "james@email.com",
    address: "321 Elm St, Tamale",
    totalOrders: 12,
    totalSpent: 950.75,
  },
  {
    id: "5",
    name: "Lisa Brown",
    phone: "0244567890",
    email: "lisa@email.com",
    address: "654 Maple Dr, Cape Coast",
    totalOrders: 6,
    totalSpent: 420.25,
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-2">Manage customer information and history</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-medium">Customer Name</TableHead>
                <TableHead className="font-medium">Phone Number</TableHead>
                <TableHead className="font-medium">Email</TableHead>
                <TableHead className="font-medium">Total Orders</TableHead>
                <TableHead className="font-medium">Total Spent</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="border-slate-100">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium">₵{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/customers/${customer.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/orders?customer=${customer.id}`}>
                          <ShoppingBag className="h-4 w-4" />
                        </Link>
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
