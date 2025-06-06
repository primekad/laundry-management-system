"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Minus, Search, Calendar } from "lucide-react"

const serviceTypes = ["Wash", "Iron", "Dry Clean", "Fold", "Starch"]
const itemTypes = ["Shirt", "Dress", "Trousers", "Bed Sheet", "Curtain", "Suit", "Blouse"]
const paymentMethods = ["Cash", "Mobile Money", "Card", "Bank Transfer"]

export default function OrderForm() {
  const [items, setItems] = useState([
    { id: 1, type: "", services: [], quantity: 1, color: "", label: "", unitPrice: 0, total: 0 },
  ])

  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      type: "",
      services: [...selectedServices],
      quantity: 1,
      color: "",
      label: "",
      unitPrice: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground">Add a new laundry order to the system</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter customer details or search existing customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Input id="phone" placeholder="0244123456" />
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" className="mt-6">
                  Search
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Textarea id="address" placeholder="Customer address" />
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="invoice">Invoice Number</Label>
                  <Input id="invoice" placeholder="Auto-generated" />
                </div>
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <div className="relative">
                    <Input id="orderDate" type="date" />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Expected Delivery</Label>
                  <div className="relative">
                    <Input id="deliveryDate" type="date" />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Service Types */}
          <Card>
            <CardHeader>
              <CardTitle>Default Service Types</CardTitle>
              <CardDescription>Select default services for all items (can be overridden per item)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((service) => (
                  <Badge
                    key={service}
                    variant={selectedServices.includes(service) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedServices((prev) =>
                        prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
                      )
                    }}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Laundry Items */}
          <Card>
            <CardHeader>
              <CardTitle>Laundry Items</CardTitle>
              <CardDescription>Add items to this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Type</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Label/Notes</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {selectedServices.map((service) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-16" defaultValue="1" min="1" />
                      </TableCell>
                      <TableCell>
                        <Input className="w-20" placeholder="Blue" />
                      </TableCell>
                      <TableCell>
                        <Input className="w-32" placeholder="Special notes" />
                      </TableCell>
                      <TableCell>₵15.00</TableCell>
                      <TableCell>₵15.00</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button variant="outline" onClick={addItem} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <Input className="w-20 text-right" placeholder="0.00" />
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Grand Total:</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input id="amountPaid" type="number" placeholder="0.00" />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Balance Due:</span>
                  <span className="font-medium">₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status:</span>
                  <Badge variant="destructive">Unpaid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue="pending">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="washing">Washing</SelectItem>
                  <SelectItem value="ironing">Ironing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Save Order
            </Button>
            <Button variant="outline" className="w-full">
              Print Receipt
            </Button>
            <Button variant="outline" className="w-full">
              Send SMS Notification
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
