import { PaymentForm } from '../../payment-form';
import { getPaymentById, getAvailableOrders } from '@/lib/data/payment-queries';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function EditPaymentPage({ params }: { params: { id: string } }) {
  const [payment, orders] = await Promise.all([
    getPaymentById(params.id),
    getAvailableOrders(),
  ]);

  if (!payment) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Payments', href: '/payments' },
          { label: 'Payment Details', href: `/payments/${payment.id}` },
          { label: 'Edit Payment', href: `/payments/${payment.id}/edit`, active: true },
        ]}
      />
      <PaymentForm payment={payment} orders={orders} intent="edit" />
    </main>
  );
}
