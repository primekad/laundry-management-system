"use client";

import { useActionState } from "react";
import { savePayment } from "./actions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = {
  error: "",
  errorFields: {},
};

export function PaymentForm({ payment, orders }: { payment?: any; orders: any[] }) {
  const [state, formAction] = useActionState(savePayment, initialState);
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.data) {
      toast.success("Payment saved successfully");
      ref.current?.reset();
      router.push("/payments");
    }
  }, [state, router]);

  return (
    <form action={formAction} ref={ref}>
      <Card>
        <CardHeader>
          <CardTitle>
            {payment ? "Edit Payment" : "Create New Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {payment && <input type="hidden" name="id" value={payment.id} />}
          <div className="grid gap-2">
            <Label>Order</Label>
            <Select name="orderId" defaultValue={payment?.orderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.id.substring(0, 8)} - {order.customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              defaultValue={payment?.amount}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <Select
              name="paymentMethod"
              defaultValue={payment?.paymentMethod}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
