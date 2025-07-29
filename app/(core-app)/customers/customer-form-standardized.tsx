'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomer, updateCustomer, type State } from './actions-standardized';
import { CreateCustomerSchema, UpdateCustomerSchema } from './customer-action-helpers';
import { useServerActionForm } from '@/hooks/use-server-action-form';
import { Button } from '@/components/ui/button';
import type { CustomerWithRelations } from './types';
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
import { toast } from 'sonner';

interface CustomerFormProps {
  customer?: CustomerWithRelations;
  intent: 'create' | 'edit';
}

type CustomerFormData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export function CustomerFormStandardized({ customer, intent }: CustomerFormProps) {
  const isEditMode = intent === 'edit';
  const initialState: State = { message: null, errors: {}, success: false };

  const action = isEditMode ? updateCustomer.bind(null, customer!.id) : createCustomer;
  const schema = isEditMode ? UpdateCustomerSchema : CreateCustomerSchema;
  
  const defaultValues: CustomerFormData = {
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  };

  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<CustomerFormData>({
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
            <CardTitle>{isEditMode ? 'Edit Customer' : 'Create Customer'}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details for this customer.' : 'Enter the details for the new customer.'}
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

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter customer name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('name').clientError}
                    serverErrors={getFieldError('name').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('email').clientError}
                    serverErrors={getFieldError('email').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('phone').clientError}
                    serverErrors={getFieldError('phone').serverErrors}
                  />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter customer address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormFieldError 
                    clientError={getFieldError('address').clientError}
                    serverErrors={getFieldError('address').serverErrors}
                  />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/customers">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Customer' : 'Create Customer'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
