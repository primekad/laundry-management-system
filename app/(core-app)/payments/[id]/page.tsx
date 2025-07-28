import { prisma } from "@/lib/db";
import { PaymentForm } from "../payment-form";

export default async function Page({ params }: { params: { id: string } }) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
  });
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
    },
  });

  return <PaymentForm payment={payment} orders={orders} />;
}
