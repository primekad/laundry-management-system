"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { getOrderById, updateOrder } from "../../actions";

// Form schema for order update
const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
});

// Form schema for payment recording
const paymentRecordSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
});

// Order status options with user-friendly labels
const orderStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Payment method options
const paymentMethodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  // Unwrap the params Promise
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Setup form for order updates
  const orderForm = useForm<z.infer<typeof orderUpdateSchema>>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: "PENDING",
      notes: "",
      expectedDeliveryDate: "",
    },
  });

  // Setup form for payment recording
  const paymentForm = useForm<z.infer<typeof paymentRecordSchema>>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "CASH",
    },
  });

  // Fetch order details when component mounts
  useEffect(() => {
    async function loadOrder() {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        // Set default form values from order data
        orderForm.reset({
          status: orderData.status,
          notes: orderData.notes || "",
          expectedDeliveryDate: "", // Will need to format this correctly if you have the date
        });

        // Set default payment amount to the remaining balance
        paymentForm.reset({
          amount: orderData.amountDue,
          paymentMethod: "CASH",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
        router.push("/orders");
      }
    }

    loadOrder();

    // Show payment dialog if action=payment in URL
    if (action === "payment") {
      setPaymentDialogOpen(true);
    }
  }, [orderId, router, orderForm, paymentForm, action]);

  // Handle order update submission
  async function handleOrderUpdate(data: z.infer<typeof orderUpdateSchema>) {
    try {
      setUpdatingOrder(true);

      // Prepare update data
      const updateData = {
        status: data.status,
        notes: data.notes,
        // Include any other fields that need to be updated
      };

      await updateOrder(orderId, updateData);

      toast({
        title: "Order Updated",
        description: "The order has been successfully updated.",
      });

      // Refresh the page to show updated data
      router.refresh();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the order.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(false);
    }
  }

  // Handle payment recording
  async function handleRecordPayment(data: z.infer<typeof paymentRecordSchema>) {
    try {
      setRecordingPayment(true);

      // Prepare payment data
      const paymentData = {
        orderId: orderId,
        amountPaid: data.amount,
        paymentMethod: data.paymentMethod,
      };

      // Update order with new payment
      await updateOrder(orderId, paymentData);

      toast({
        title: "Payment Recorded",
        description: `Payment of ₵${data.amount.toFixed(2)} has been recorded.`,
      });

      // Close dialog and refresh
      setPaymentDialogOpen(false);
      router.refresh();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Payment Failed",
        description: "There was a problem recording the payment.",
        variant: "destructive",
      });
    } finally {
      setRecordingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="gap-1">
            <Link href={`/orders/${orderId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Order Details
            </Link>
          </Button>
        </div>
      </div>

      {/* Order title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Order</h1>
        <p className="text-slate-600 mt-1">{order.invoiceNumber}</p>
      </div>

      {/* Edit Order Form */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Update Order Status and Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...orderForm}>
            <form
              onSubmit={orderForm.handleSubmit(handleOrderUpdate)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={orderForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={orderForm.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={orderForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this order"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingOrder}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updatingOrder ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setPaymentDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Record Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Recording Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit(handleRecordPayment)}
              className="space-y-4 py-4"
            >
              <div className="grid gap-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Balance due:</span>
                  <span className="font-medium">₵{order?.amountDue.toFixed(2)}</span>
                </div>

                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value <= order?.amountDue ? value : order?.amountDue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={recordingPayment}
                  className="bg-primary hover:bg-primary/90"
                >
                  {recordingPayment ? "Recording..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}