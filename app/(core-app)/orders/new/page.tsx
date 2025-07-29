"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Customer, LaundryCategory, ServiceType } from "@prisma/client"
import { z } from "zod"
import { useBranch } from "@/components/providers/branch-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, Calendar, ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CustomerSearch } from "./customer-search"
import { LaundryItemRow } from "./laundry-item-row"
import { fetchLaundryCategories, fetchServiceTypes, fetchServices, fetchAllPricingRules, createOrder } from "../actions"

const paymentMethods = ["CASH", "MOBILE_MONEY", "CARD", "BANK_TRANSFER"]

// Zod schema for validation
const orderSchema = z.object({
  notes: z.string().optional(),
  customInvoiceNumber: z.string().optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  amountPaid: z.coerce.number().min(0, "Amount must be positive"),
  discount: z.coerce.number().min(0, "Discount must be positive"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
})

type OrderFormValues = z.infer<typeof orderSchema>

// Type definition for laundry items
interface LaundryItemType {
  id: string
  categoryId: string
  serviceTypeId: string
  quantity: number
  size: string
  notes: string
  unitPrice: number
  total: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { activeBranch } = useBranch()
  
  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      notes: "",
      customInvoiceNumber: "",
      orderDate: new Date().toISOString().split('T')[0], // Default to current date
      expectedDeliveryDate: "",
      amountPaid: 0,
      discount: 0,
      paymentMethod: "",
    },
  })
  
  // State management
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<LaundryItemType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form values
  const discount = watch("discount") || 0
  const amountPaid = watch("amountPaid") || 0
  
  // Fetch laundry categories and service types
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["laundryCategories"],
    queryFn: fetchLaundryCategories,
  })
  
  const { data: serviceTypes, isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: fetchServiceTypes,
  })
  
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  })
  
  // Debug: Check services data
  console.log('Services in page component:', services)
  
  // Function to refresh all queries
  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['serviceTypes'] })
    queryClient.invalidateQueries({ queryKey: ['services'] })
    console.log('Queries invalidated, data should refresh')
  }
  
  const { data: pricingRules, isLoading: isLoadingPricingRules } = useQuery({
    queryKey: ["pricingRules"],
    queryFn: fetchAllPricingRules,
  })
  
  const isLoading = isLoadingCategories || isLoadingServiceTypes || isLoadingServices || isLoadingPricingRules
  
  // Handle customer selection
  const handleCustomerSelect = (selectedCustomer: Customer | null) => {
    setCustomer(selectedCustomer)
  }
  
  // Handle customer creation
  const handleCustomerCreate = (newCustomer: Customer) => {
    setCustomer(newCustomer)
  }
  
  // Add new item to order
  const addItem = () => {
    const newItem = {
      id: `${items.length + 1}`,
      categoryId: "",
      serviceTypeId: "",
      quantity: 1,
      size: "",
      notes: "",
      unitPrice: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }
  
  // Remove item from order
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }
  
  // Handle item field changes
  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prevItems => {
      return prevItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          
          // Update total if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          
          return updatedItem
        }
        return item
      })
    })
  }
  
  // Calculate order totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const grandTotal = subtotal - discount
  const balanceDue = grandTotal - amountPaid
  
  // Get payment status text
  const getPaymentStatus = () => {
    if (amountPaid <= 0) return "Unpaid"
    if (amountPaid < grandTotal) return "Partially Paid"
    return "Paid"
  }
  
  // Form submission handler
  const onSubmit = async (data: OrderFormValues) => {
    if (!customer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select or create a customer",
      })
      return
    }
    
    if (items.length === 0 || items.some(item => !item.categoryId || !item.serviceTypeId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one valid laundry item",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Check if we have an active branch
      if (!activeBranch) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No active branch selected. Please select a branch first.",
        })
        return
      }

      const orderData = {
        isExistingCustomer: !!customer.id,
        customerId: customer.id || undefined,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || undefined,
        customerAddress: customer.address || undefined,
        items: items,
        amountPaid: data.amountPaid,
        discount: data.discount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        orderDate: data.orderDate || undefined,
        expectedDeliveryDate: data.expectedDeliveryDate || undefined,
        branchId: activeBranch.id,
        customInvoiceNumber: data.customInvoiceNumber || undefined,
      }
      
      const result = await createOrder(orderData)
      
      toast({
        title: "Success",
        description: "Order created successfully",
      })
      
      // Redirect to the order details page
      if (result && result.id) {
        router.push(`/orders/${result.id}`)
      } else {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href="/orders" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Order</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Order Information</CardTitle>
              <CardDescription>Enter order details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div>
                  <Label htmlFor="customInvoiceNumber">Invoice Number</Label>
                  <Input
                    id="customInvoiceNumber"
                    {...register("customInvoiceNumber")}
                    placeholder="Leave blank for auto-generated invoice number"
                    className="mt-1"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="orderDate"
                      type="date"
                      {...register("orderDate")}
                      className="w-full"
                    />
                    <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                  </div>
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      {...register("expectedDeliveryDate")}
                      className="w-full"
                    />
                    <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Add any special instructions or notes about this order"
                    className="min-h-[80px] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Customer Information</CardTitle>
              <CardDescription>Search for existing customer or add a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSearch
                onSelectCustomer={handleCustomerSelect}
              />
            </CardContent>
          </Card>
          
          {/* Laundry Items */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Laundry Items</CardTitle>
              <CardDescription>Add items to this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    {items.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
                        No items added yet. Click "Add Item" to begin.
                      </div>
                    ) : (
                      <div className="w-full">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b mb-2">
                              <th className="text-left py-2 font-medium text-slate-600">Item Type</th>
                              <th className="text-left py-2 font-medium text-slate-600">Service</th>
                              <th className="text-left py-2 font-medium text-slate-600">Qty</th>
                              <th className="text-left py-2 font-medium text-slate-600">Size</th>
                              <th className="text-left py-2 font-medium text-slate-600">Notes</th>
                              <th className="text-left py-2 font-medium text-slate-600">Unit Price</th>
                              <th className="text-left py-2 font-medium text-slate-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={item.id} className="border-b last:border-b-0">
                                <LaundryItemRow
                                  key={item.id}
                                  index={index}
                                  item={item}
                                  categories={categories || []}
                                  services={(serviceTypes || []) as any}
                                  pricingRules={pricingRules as any || []}
                                  onChangeField={handleItemChange}
                                  onRemove={() => removeItem(item.id)}
                                />
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="flex gap-2">

                      <Button
                        variant="outline"
                        onClick={addItem}
                        className="flex w-full items-center justify-center"
                        type="button"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          

        </div>
        
        {/* Summary & Payment */}
        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>GHS {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount:</span>
                <div className="w-24">
                  <Input
                    type="number"
                    {...register("discount")}
                    className="text-right"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>GHS {grandTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min="0"
                  {...register("amountPaid")}
                  className="mt-1"
                />
                {errors.amountPaid && (
                  <span className="text-sm text-red-500">{errors.amountPaid.message}</span>
                )}
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  onValueChange={(value) => setValue("paymentMethod", value)}
                  defaultValue=""
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <span className="text-sm text-red-500">{errors.paymentMethod.message}</span>
                )}
              </div>
              
              <div className="flex justify-between font-medium">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? "text-red-500" : "text-green-500"}>
                  GHS {balanceDue.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Payment Status:</span>
                <Badge variant={
                  getPaymentStatus() === "Paid" ? "default" :
                  getPaymentStatus() === "Partially Paid" ? "secondary" : "destructive"
                }>
                  {getPaymentStatus()}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
