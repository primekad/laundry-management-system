import { db } from "@/lib/db";
import { PaymentForm } from "../payment-form";

export default async function Page() {
  const orders = await db.order.findMany({
    include: {
      customer: true,
    },
  });
  return <PaymentForm orders={orders} />;
}
