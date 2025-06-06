"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, Plus, Search, ShoppingBag } from "lucide-react"

const customers = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "0244123456",
    email: "sarah@email.com",
    address: "123 Main St, Accra",
    totalOrders: 15,
    totalSpent: 1250.0,
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "0244789012",
    email: "michael@email.com",
    address: "456 Oak Ave, Kumasi",
    totalOrders: 8,
    totalSpent: 680.5,
  },
  {
    id: 3,
    name: "Emma Davis",
    phone: "0244345678",
    email: "emma@email.com",
    address: "789 Pine Rd, Takoradi",
    totalOrders: 22,
    totalSpent: 1890.0,
  },
  {
    id: 4,
    name: "James Wilson",
    phone: "0244901234",
    email: "james@email.com",
    address: "321 Elm St, Tamale",
    totalOrders: 12,
    totalSpent: 950.75,
  },
  {
    id: 5,
    name: "Lisa Brown",
    phone: "0244567890",
    email: "lisa@email.com",
    address: "654 Maple Dr, Cape Coast",
    totalOrders: 6,
    totalSpent: 420.25,
  },
]

export default function CustomersList() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer information and history</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
          <CardDescription>Find customers by name, phone, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>₵{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ShoppingBag className="h-4 w-4" />
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
