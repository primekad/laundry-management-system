'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createPayment, updatePayment, type State } from './actions';
import { CreatePaymentSchema, UpdatePaymentSchema, PaymentMethod, PaymentStatus } from './payment-action-helpers';
import { useServerActionForm } from '@/hooks/use-server-action-form';
import { Button } from '@/components/ui/button';
import type { PaymentWithOrder } from './types';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormFieldError } from '@/components/ui/form-field-error';
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

export function PaymentForm({ payment, orders, intent }: PaymentFormProps) {
  const isEditMode = intent === 'edit';
  const initialState: State = { message: null, errors: {}, success: false };


  const action = isEditMode ? updatePayment.bind(null, payment!.id) : createPayment;
  const schema = isEditMode ? UpdatePaymentSchema : CreatePaymentSchema;

  const defaultValues: PaymentFormData = {
    orderId: payment?.orderId || '',
    amount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || PaymentMethod.CASH,
    transactionId: payment?.transactionId || '',
    ...(isEditMode ? { status: payment?.status || PaymentStatus.PAID } : { status: PaymentStatus.PAID }),
  };

  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<PaymentFormData>({
    action,
    initialState,
    formOptions: {
      resolver: zodResolver(schema),
      defaultValues,
      mode: 'onTouched',
    },
  });

  // Debug log to check if form is properly initialized
  console.log('Form initialized:', !!form, 'Form control:', !!form?.control);

  // Show success message
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
    }
  }, [state.success, state.message]);

  // Show general error message
  useEffect(() => {
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.message, state.success]);

  // Safety check - don't render if form is not properly initialized
  if (!form || !form.control) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading form...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Payment' : 'Create Payment'}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details for this payment.' : 'Enter the details for the new payment.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* General form error */}
            {state.errors?.form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.errors.form.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Order Selection */}
            <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.invoiceNumber} - {order.customer.name} (₵{order.totalAmount.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormFieldError
                  clientError={getFieldError('orderId').clientError}
                  serverErrors={getFieldError('orderId').serverErrors}
                />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
                <FormFieldError
                  clientError={getFieldError('amount').clientError}
                  serverErrors={getFieldError('amount').serverErrors}
                />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormFieldError
                  clientError={getFieldError('paymentMethod').clientError}
                  serverErrors={getFieldError('paymentMethod').serverErrors}
                />
              </FormItem>
            )}
          />

          {/* Transaction ID */}
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter transaction ID" {...field} />
                </FormControl>
                <FormMessage />
                <FormFieldError
                  clientError={getFieldError('transactionId').clientError}
                  serverErrors={getFieldError('transactionId').serverErrors}
                />
              </FormItem>
            )}
          />

          {/* Status (only for edit mode) */}
          {isEditMode && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PaymentStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormFieldError
                    clientError={getFieldError('status').clientError}
                    serverErrors={getFieldError('status').serverErrors}
                  />
                </FormItem>
              )}
            />
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
      </Card>
    </form>
    </Form>
  );
}
