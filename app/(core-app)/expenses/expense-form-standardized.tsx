'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createExpense, updateExpense, type State } from './actions';
import { CreateExpenseSchema, UpdateExpenseSchema } from './expense-action-helpers';
import { useServerActionForm } from '@/hooks/use-server-action-form';
import { Button } from '@/components/ui/button';
import type { ExpenseWithRelations } from './types';
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
import { Textarea } from '@/components/ui/textarea';
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
import { format } from 'date-fns';

interface ExpenseFormProps {
  expense?: ExpenseWithRelations;
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  branches: Array<{
    id: string;
    name: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  orders: Array<{
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
    };
  }>;
  intent: 'create' | 'edit';
}

type ExpenseFormData = {
  description: string;
  amount: number;
  date: Date;
  branchId: string;
  userId: string;
  categoryId: string;
  orderId?: string;
  receiptUrl?: string;
};

export function ExpenseFormStandardized({ expense, categories, branches, users, orders, intent }: ExpenseFormProps) {
  const isEditMode = intent === 'edit';
  const initialState: State = { message: null, errors: {}, success: false };

  const action = isEditMode ? updateExpense.bind(null, expense!.id) : createExpense;
  const schema = isEditMode ? UpdateExpenseSchema : CreateExpenseSchema;
  
  const defaultValues: ExpenseFormData = {
    description: expense?.description || '',
    amount: expense?.amount || 0,
    date: expense?.date || new Date(),
    branchId: expense?.branchId || '',
    userId: expense?.userId || '',
    categoryId: expense?.categoryId || '',
    orderId: expense?.orderId || 'none',
    receiptUrl: expense?.receiptUrl || '',
  };

  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<ExpenseFormData>({
    action,
    initialState,
    formOptions: {
      resolver: zodResolver(schema),
      defaultValues,
      mode: 'onTouched',
    },
  });

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
            <CardTitle>{isEditMode ? 'Edit Expense' : 'Create Expense'}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details for this expense.' : 'Enter the details for the new expense.'}
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter expense description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('description').clientError}
                    serverErrors={getFieldError('description').serverErrors}
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

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('date').clientError}
                    serverErrors={getFieldError('date').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('categoryId').clientError}
                    serverErrors={getFieldError('categoryId').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Branch */}
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('branchId').clientError}
                    serverErrors={getFieldError('branchId').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* User */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('userId').clientError}
                    serverErrors={getFieldError('userId').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Order (Optional) */}
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No order</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.invoiceNumber} - {order.customer.name}
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

            {/* Receipt URL (Optional) */}
            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/receipt.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('receiptUrl').clientError}
                    serverErrors={getFieldError('receiptUrl').serverErrors}
                  />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/expenses">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Expense' : 'Create Expense'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
