'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { PaymentListItem } from './types';

interface PaymentDetailsModalProps {
  payment: PaymentListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsModal({ payment, open, onOpenChange }: PaymentDetailsModalProps) {
  const statusConfig = {
    PAID: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800 border-amber-200" },
    FAILED: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
    REFUNDED: { variant: "outline" as const, className: "bg-slate-100 text-slate-800 border-slate-200" },
  };

  const config = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Amount</label>
                <p className="text-lg font-semibold text-slate-900">
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
                <label className="text-sm font-medium text-slate-600">Date</label>
                <p className="text-slate-900">{format(payment.createdAt, "PPP")}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Order Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">Invoice Number</label>
                <p className="text-slate-900">{payment.order.invoiceNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Customer</label>
                <p className="text-slate-900">{payment.order.customer.name}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href={`/payments/${payment.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Full Details
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/payments/${payment.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Payment
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
