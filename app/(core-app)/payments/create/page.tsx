import { PaymentFormSimple as PaymentForm } from '../payment-form-simple';
import { getAvailableOrders } from '@/lib/data/payment-queries';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function CreatePaymentPage() {
  const orders = await getAvailableOrders();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Payments',
            href: '/payments',
          },
          {
            label: 'Create Payment',
            href: '/payments/create',
            active: true,
          },
        ]}
      />
      <PaymentForm orders={orders} intent="create" />
    </main>
  );
}
