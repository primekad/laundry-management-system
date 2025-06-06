"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Search } from "lucide-react"

const expenses = [
  {
    id: 1,
    date: "2025-01-15",
    title: "Detergent Purchase",
    category: "Supplies",
    amount: 150.0,
    paidTo: "ChemCorp Ltd",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: 2,
    date: "2025-01-14",
    title: "Electricity Bill",
    category: "Utilities",
    amount: 320.5,
    paidTo: "ECG",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: 3,
    date: "2025-01-13",
    title: "Machine Repair",
    category: "Maintenance",
    amount: 450.0,
    paidTo: "TechFix Services",
    linkedOrder: "INV-2025-001",
    recordedBy: "Sarah Manager",
  },
  {
    id: 4,
    date: "2025-01-12",
    title: "Staff Salary",
    category: "Payroll",
    amount: 1200.0,
    paidTo: "John Staff",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: 5,
    date: "2025-01-11",
    title: "Fabric Softener",
    category: "Supplies",
    amount: 85.75,
    paidTo: "Supplies Plus",
    linkedOrder: null,
    recordedBy: "Front Desk",
  },
]

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵2,206.25</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Payroll</div>
            <p className="text-xs text-muted-foreground">₵1,200.00 (54%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵150.00</div>
            <p className="text-xs text-muted-foreground">1 transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter expenses by category or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, paid to, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title/Reason</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid To</TableHead>
                <TableHead>Linked Order</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>₵{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.paidTo}</TableCell>
                  <TableCell>{expense.linkedOrder || "-"}</TableCell>
                  <TableCell>{expense.recordedBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
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
