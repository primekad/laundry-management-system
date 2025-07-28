import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Edit } from 'lucide-react';

import { getOrderById } from '../actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OrderActionButtons } from "@/components/order-action-buttons";
import { EditOrderButton } from "@/components/edit-order-button";
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Define types for the complete order with relations
type OrderWithRelations = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  branchId: string;
  invoiceNumber: string;
  customerId: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: Array<{
    id: string;
    orderId: string;
    serviceTypeId: string;
    categoryId: string | null;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
    serviceType: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    } | null;
  }>;
  payments: Array<{
    id: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    createdAt: Date;
  }>;
  branch: {
    id: string;
    name: string;
  };
};

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Fetch order data
  let order: OrderWithRelations;
  const awaitedParams = await params;
  const id =  awaitedParams.id;
  try {
    order = await getOrderById(id) as OrderWithRelations;
  } catch (error) {
    console.error('Error fetching order:', error);
    return notFound();
  }

  if (!order) {
    return notFound();
  }

  // Format dates for display
  const orderDate = new Date(order.createdAt);
  const expectedDeliveryDate = new Date(orderDate);
  expectedDeliveryDate.setDate(orderDate.getDate() + 2); // Assuming 2-day delivery

  // Helper function for payment status badge
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants = {
      PENDING: "bg-red-100 text-red-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
    };
    
    const labels = {
      PENDING: "Unpaid",
      PARTIAL: "Partially Paid",
      PAID: "Paid"
    };
    
    return <Badge className={cn("border-0 font-medium", variants[status])}>{labels[status]}</Badge>;
  };

  // Helper function for order status badge
  const getOrderStatusBadge = (status: OrderStatus) => {
    const variants = {
      PENDING: "bg-red-100 text-red-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      READY_FOR_PICKUP: "bg-green-100 text-green-700",
      COMPLETED: "bg-gray-100 text-gray-700",
      CANCELLED: "bg-slate-100 text-slate-700",
    };
    
    const labels = {
      PENDING: "Pending",
      PROCESSING: "Washing",
      READY_FOR_PICKUP: "Ready",
      COMPLETED: "Delivered",
      CANCELLED: "Cancelled",
    };
    
    return <Badge className={cn("border-0 font-medium", variants[status])}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="gap-1">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Order title and invoice */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="text-slate-600 mt-1">{order.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <EditOrderButton order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Order Information
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Basic order details and status</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Order Date</h3>
                  <p className="mt-1 text-slate-900">
                    {format(orderDate, 'yyyy-MM-dd')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Expected Delivery</h3>
                  <p className="mt-1 text-slate-900">
                    {format(expectedDeliveryDate, 'yyyy-MM-dd')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Order Status</h3>
                  <div className="mt-1">{getOrderStatusBadge(order.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Payment Status</h3>
                  <div className="mt-1">{getPaymentStatusBadge(order.paymentStatus)}</div>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-slate-500">Notes</h3>
                    <p className="mt-1 text-slate-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Name</h3>
                  <p className="mt-1 text-slate-900">{order.customer.name}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Phone</h3>
                    <p className="mt-1 text-slate-900">{order.customer.phone}</p>
                  </div>
                )}
                {order.customer.email && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Email</h3>
                    <p className="mt-1 text-slate-900">{order.customer.email}</p>
                  </div>
                )}
                {order.customer.address && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Address</h3>
                    <p className="mt-1 text-slate-900">{order.customer.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Item</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Services</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Qty</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Details</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Unit Price</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-4 px-4 text-sm text-slate-900">
                          <div className="font-medium">
                            {item.category?.name || "General"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-900">
                          <Badge variant="outline" className="bg-slate-50 font-normal">
                            {item.serviceType.name}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-900">{item.quantity}</td>
                        <td className="py-4 px-4 text-sm text-slate-900">
                          {item.notes || "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-900">₵{item.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-900">₵{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Payment Summary and Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">₵{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-slate-900">₵{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>₵{order.amountPaid.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-red-600">
                  <span>Balance Due:</span>
                  <span>₵{order.amountDue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <OrderActionButtons 
                order={{
                  id: order.id,
                  status: order.status,
                  notes: order.notes,
                  amountDue: order.amountDue
                }} 
              />
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {order.payments.length > 0 ? (
                <div className="space-y-4">
                  {order.payments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="border border-yellow-200 rounded-md p-4 bg-yellow-50"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">₵{payment.amount.toFixed(2)}</span>
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          {payment.paymentMethod}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {format(new Date(payment.createdAt), 'yyyy-MM-dd')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No payment history available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}