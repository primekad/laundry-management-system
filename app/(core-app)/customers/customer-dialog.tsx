"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Import the real server actions
import { createCustomer, updateCustomer } from "../../../app/(core-app)/customers/actions";

import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import type { Customer } from "./types";

const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerDialogProps {
  children: React.ReactNode;
  customer?: Customer;
  viewOnly?: boolean;
}

export function CustomerDialog({ children, customer, viewOnly = false }: CustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const defaultValues: Partial<CustomerFormValues> = {
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsPending(true);
    try {
      // Convert the form data to match the expected types for the server action
      const customerData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,  // Convert empty string to null if needed
        address: data.address || null, // Convert undefined to null
      };

      if (customer) {
        await updateCustomer(customer.id, customerData);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(customerData);
        toast.success("Customer created successfully");
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to save customer");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {viewOnly ? "View Customer Details" : customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        {viewOnly ? (
                          <div className="p-2 border rounded-md bg-gray-50">{field.value}</div>
                        ) : (
                          <Input placeholder="Customer name" {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        {viewOnly ? (
                          <div className="p-2 border rounded-md bg-gray-50">{field.value}</div>
                        ) : (
                          <Input placeholder="customer@example.com" {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        {viewOnly ? (
                          <div className="p-2 border rounded-md bg-gray-50">{field.value || "--"}</div>
                        ) : (
                          <Input placeholder="Phone number" {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        {viewOnly ? (
                          <div className="p-2 border rounded-md bg-gray-50 min-h-[80px]">
                            {field.value || "--"}
                          </div>
                        ) : (
                          <Textarea
                            placeholder="Customer address"
                            className="resize-none"
                            {...field}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    {viewOnly ? "Close" : "Cancel"}
                  </Button>
                  {!viewOnly && (
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving..." : "Save Customer"}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
