'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import {ArrowLeft, Calendar, Loader2, Plus} from 'lucide-react';
import {useToast} from '@/components/ui/use-toast';
import Link from 'next/link';
import {Customer, LaundryCategory, ServiceType} from '@prisma/client';
import {createOrder, updateOrder} from './actions-standardized';
import {formatDateForInput} from './order-action-helpers';
import type {OrderWithRelations} from './types';
import {CustomerSearch} from './new/customer-search';
import {LaundryItemRow} from './new/laundry-item-row';

const paymentMethods = ["CASH", "CARD", "BANK_TRANSFER"]; // Match Prisma schema

// Zod schema for validation (matching original)
const orderSchema = z.object({
  notes: z.string().optional(),
  customInvoiceNumber: z.string().optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  amountPaid: z.coerce.number().min(0, "Amount must be positive"),
  discount: z.coerce.number().min(0, "Discount must be positive"),
  paymentMethod: z.string().optional(),
}).refine((data) => {
  // If amount paid is greater than 0, payment method is required
  if (data.amountPaid && data.amountPaid > 0 && !data.paymentMethod) {
    return false;
  }
  return true;
}, {
  message: 'Payment method is required when amount paid is greater than 0.',
  path: ['paymentMethod'],
});

type OrderFormValues = z.infer<typeof orderSchema>;

// Type definition for laundry items (matching original)
interface LaundryItemType {
  id: string;
  categoryId: string;
  serviceTypeId: string;
  quantity: number;
  size: string;
  notes: string;
  unitPrice: number;
  total: number;
}

// Props type
type OrderFormProps = {
  order?: OrderWithRelations;
  customers: Array<{ id: string; name: string; email: string; phone: string | null; address: string | null }>;
  branches: Array<{ id: string; name: string; address: string | null; phone: string | null }>;
  serviceTypes: Array<{ id: string; name: string; description: string | null }>;
  categories: LaundryCategory[];
  services: ServiceType[];
  pricingRules: Array<any>;
  intent: 'create' | 'edit';
};

export function OrderFormStandardized({
  order,
  customers,
  branches,
  serviceTypes,
  categories,
  services,
  pricingRules,
  intent
}: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = intent === 'edit';

  // Form setup (matching original)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      notes: order?.notes || "",
      customInvoiceNumber: order?.invoiceNumber || "",
      // Fix the order date - default to today for new orders, use existing date for edits
      orderDate: order?.orderDate ? formatDateForInput(order.orderDate) : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: order?.expectedDeliveryDate ? formatDateForInput(order.expectedDeliveryDate) : "",
      amountPaid: order?.amountPaid || 0,
      discount: order?.discount || 0,
      paymentMethod: order?.payments?.[0]?.paymentMethod || "",
    },
  });

  // State management (matching original)
  const [customer, setCustomer] = useState<Customer | null>(order?.customer || null);
  const [items, setItems] = useState<LaundryItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form values (matching original)
  const discount = watch("discount") || 0;
  const amountPaid = watch("amountPaid") || 0;

  // Clear payment method when amount paid becomes 0
  useEffect(() => {
    if (amountPaid === 0) {
      setValue("paymentMethod", "");
    }
  }, [amountPaid, setValue]);

  // Initialize items from order data
  useEffect(() => {
    if (order?.items) {
      const formItems: LaundryItemType[] = order.items.map((item, index) => ({
        id: `${index + 1}`,
        categoryId: item.categoryId || '',
        serviceTypeId: item.serviceTypeId,
        quantity: item.quantity,
        size: item.size || '',
        notes: item.notes || '',
        unitPrice: item.price,
        total: item.subtotal,
      }));
      setItems(formItems);
    }
  }, [order]);

  // Handle customer selection (matching original)
  const handleCustomerSelect = (selectedCustomer: any) => {
    setCustomer(selectedCustomer);
  };

  // Add new item to order (matching original)
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
    };
    setItems([...items, newItem]);
  };

  // Remove item from order (matching original)
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Handle item field changes (matching original)
  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prevItems => {
      return prevItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Update total if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }

          return updatedItem;
        }
        return item;
      });
    });
  };

  // Calculate order totals (matching original)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal - discount;
  const balanceDue = grandTotal - amountPaid;

  // Get payment status text (matching original)
  const getPaymentStatus = () => {
    if (amountPaid <= 0) return "Unpaid";
    if (amountPaid < grandTotal) return "Partially Paid";
    return "Paid";
  };

  // Form submission handler (using standardized backend)
  const onSubmit = async (data: OrderFormValues) => {
    if (!customer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select or create a customer",
      });
      return;
    }

    if (items.length === 0 || items.some(item => !item.categoryId || !item.serviceTypeId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one valid laundry item",
      });
      return;
    }

    setIsSubmitting(true);

    // Validate required data
    if (!branches || branches.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No branches available. Please contact administrator.",
      });
      setIsSubmitting(false);
      return;
    }

    // Create FormData for server action
    const formData = new FormData();
    formData.append('customerId', customer.id);
    formData.append('branchId', branches[0].id); // Use first available branch
    formData.append('notes', data.notes || '');
    formData.append('discount', data.discount.toString());
    formData.append('orderDate', data.orderDate || '');
    formData.append('expectedDeliveryDate', data.expectedDeliveryDate || '');
    formData.append('items', JSON.stringify(items));

    if (!isEditMode) {
      // Add payment info for new orders
      formData.append('amountPaid', data.amountPaid.toString());
      // Only append payment method if amount paid > 0
      if (data.amountPaid > 0 && data.paymentMethod) {
        formData.append('paymentMethod', data.paymentMethod);
      }
      formData.append('customInvoiceNumber', data.customInvoiceNumber || '');
    }

    try {
      if (isEditMode) {
        // Update existing order - this will redirect on success
        await updateOrder(order!.id, { message: null, errors: {}, success: false }, formData);
      } else {
        // Create new order - this will redirect on success
        await createOrder({ message: null, errors: {}, success: false }, formData);
      }
    } catch (error) {
      // Only catch non-redirect errors
      console.error("Error submitting order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Order' : 'Create New Order'}</h1>
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
          {!isEditMode && (
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Customer Information</CardTitle>
                <CardDescription>Search for existing customer or add a new one</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSearch onSelectCustomer={handleCustomerSelect} />
              </CardContent>
            </Card>
          )}

          {/* Laundry Items */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Laundry Items</CardTitle>
              <CardDescription>Add items to this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                              index={index}
                              item={item}
                              categories={categories}
                              services={services}
                              pricingRules={pricingRules}
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

          {!isEditMode && (
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

                {/* Only show payment method field if amount paid > 0 */}
                {watch("amountPaid") > 0 && (
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
                )}

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
          )}

          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating Order...' : 'Creating Order...'}
              </>
            ) : (
              isEditMode ? 'Update Order' : 'Create Order'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
