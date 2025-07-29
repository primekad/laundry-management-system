import { db } from "@/lib/db";
import { PaymentsDataTable } from "./payment-data-table";

async function getPayments() {
  const payments = await db.payment.findMany({
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
  });
  return payments;
}

export async function PaymentsTable() {
  const payments = await getPayments();
  // @ts-ignore
  return <PaymentsDataTable data={payments} />;
}
