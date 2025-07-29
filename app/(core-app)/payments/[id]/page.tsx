import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

import { getPaymentById, getAvailableOrders } from '@/lib/data/payment-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentActions } from '../buttons';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function PaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPaymentById(id);

  if (!payment) {
    notFound();
  }

  const statusConfig = {
    PAID: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800 border-amber-200" },
    FAILED: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
    REFUNDED: { variant: "outline" as const, className: "bg-slate-100 text-slate-800 border-slate-200" },
  };

  const config = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Payments', href: '/payments' },
          { label: 'Payment Details', href: `/payments/${payment.id}`, active: true },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/payments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Details</h1>
            <p className="text-slate-600">
              Payment for {payment.order.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/payments/${payment.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Payment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Amount</label>
                <p className="text-xl font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  }).format(payment.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <Badge variant={config.variant} className={config.className}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Payment Method</label>
                <p className="text-slate-900">{payment.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Transaction ID</label>
                <p className="text-slate-900">{payment.transactionId || 'N/A'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Payment Date</label>
              <p className="text-slate-900">{format(payment.createdAt, "PPP 'at' p")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Invoice Number</label>
              <p className="text-slate-900 font-medium">{payment.order.invoiceNumber}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Customer</label>
              <div className="space-y-1">
                <p className="text-slate-900 font-medium">{payment.order.customer.name}</p>
                <p className="text-sm text-slate-600">{payment.order.customer.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Order Total</label>
              <p className="text-slate-900 font-medium">
                {new Intl.NumberFormat("en-GH", {
                  style: "currency",
                  currency: "GHS",
                }).format(payment.order.totalAmount)}
              </p>
            </div>

            <div className="pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/orders/${payment.order.id}`}>
                  View Order Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
