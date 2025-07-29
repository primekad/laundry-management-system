"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Search } from "lucide-react"

const expenses = [
  {
    id: "1",
    date: "2025-01-15",
    title: "Detergent Purchase",
    category: "Supplies",
    amount: 150.0,
    paidTo: "ChemCorp Ltd",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: "2",
    date: "2025-01-14",
    title: "Electricity Bill",
    category: "Utilities",
    amount: 320.5,
    paidTo: "ECG",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: "3",
    date: "2025-01-13",
    title: "Machine Repair",
    category: "Maintenance",
    amount: 450.0,
    paidTo: "TechFix Services",
    linkedOrder: "INV-2025-001",
    recordedBy: "Sarah Manager",
  },
  {
    id: "4",
    date: "2025-01-12",
    title: "Staff Salary",
    category: "Payroll",
    amount: 1200.0,
    paidTo: "John Staff",
    linkedOrder: null,
    recordedBy: "Kwasi Danso",
  },
  {
    id: "5",
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
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-600 mt-2">Track and manage business expenses</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Total Expenses (This Month)</p>
              <p className="text-3xl font-bold text-slate-900">₵2,206.25</p>
              <p className="text-sm font-medium text-success">+12% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Largest Category</p>
              <p className="text-3xl font-bold text-slate-900">Payroll</p>
              <p className="text-sm font-medium text-slate-500">₵1,200.00 (54%)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Expenses Today</p>
              <p className="text-3xl font-bold text-slate-900">₵150.00</p>
              <p className="text-sm font-medium text-slate-500">1 transaction</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title, paid to, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-white border-slate-200">
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
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Expenses ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Title/Reason</TableHead>
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium">Amount</TableHead>
                <TableHead className="font-medium">Paid To</TableHead>
                <TableHead className="font-medium">Recorded By</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="border-slate-100">
                  <TableCell>{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="font-medium">₵{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.paidTo}</TableCell>
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
