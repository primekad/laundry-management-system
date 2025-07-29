'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createPayment, updatePayment } from './actions';
import { CreatePaymentSchema, UpdatePaymentSchema, PaymentMethod, PaymentStatus } from './payment-action-helpers';

// Define enum values as arrays for iteration
const PAYMENT_METHODS = Object.values(PaymentMethod) as PaymentMethod[];
const PAYMENT_STATUSES = Object.values(PaymentStatus) as PaymentStatus[];
import { Button } from '@/components/ui/button';
import type { PaymentWithOrder } from './types';
import Link from 'next/link';
import { useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

interface PaymentFormProps {
  payment?: PaymentWithOrder;
  orders: Array<{
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    totalAmount: number;
  }>;
  intent: 'create' | 'edit';
}

type PaymentFormData = {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
};

export function PaymentFormSimple({ payment, orders, intent }: PaymentFormProps) {
  const isEditMode = intent === 'edit';
  const [isPending, startTransition] = useTransition();

  const schema = isEditMode ? UpdatePaymentSchema : CreatePaymentSchema;
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderId: payment?.orderId || '',
      amount: payment?.amount || 0,
      paymentMethod: payment?.paymentMethod || PaymentMethod.CASH,
      transactionId: payment?.transactionId || '',
      status: payment?.status || PaymentStatus.PAID,
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('orderId', data.orderId);
        formData.append('amount', data.amount.toString());
        formData.append('paymentMethod', data.paymentMethod);
        if (data.transactionId) {
          formData.append('transactionId', data.transactionId);
        }
        if (data.status) {
          formData.append('status', data.status);
        }

        if (isEditMode && payment) {
          await updatePayment(payment.id, { message: null, errors: {}, success: false }, formData);
        } else {
          await createPayment({ message: null, errors: {}, success: false }, formData);
        }
        
        toast.success(`Payment ${isEditMode ? 'updated' : 'created'} successfully`);
      } catch (error) {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} payment`);
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Payment' : 'Create Payment'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Update the details for this payment.' : 'Enter the details for the new payment.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-6">
          {/* Order Selection */}
          <div className="grid gap-2">
            <Label htmlFor="orderId">Order</Label>
            <Select 
              value={form.watch('orderId')} 
              onValueChange={(value) => form.setValue('orderId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.invoiceNumber} - {order.customer.name} (₵{order.totalAmount.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.orderId && (
              <p className="text-sm text-red-500">{form.formState.errors.orderId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select 
              value={form.watch('paymentMethod')} 
              onValueChange={(value) => form.setValue('paymentMethod', value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod && (
              <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Transaction ID */}
          <div className="grid gap-2">
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction ID"
              {...form.register('transactionId')}
            />
            {form.formState.errors.transactionId && (
              <p className="text-sm text-red-500">{form.formState.errors.transactionId.message}</p>
            )}
          </div>

          {/* Status (only for edit mode) */}
          {isEditMode && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value) => form.setValue('status', value as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/payments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Payment' : 'Create Payment'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
