'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordPaymentDialog } from '@/components/record-payment-dialog';
import { EditOrderButton } from '@/components/edit-order-button';

interface OrderActionButtonsProps {
  order: {
    id: string;
    status: any;
    notes?: string | null;
    amountDue: number;
  };
}

export function OrderActionButtons({ order }: OrderActionButtonsProps) {
  const router = useRouter();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setPaymentDialogOpen(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
        <EditOrderButton order={order} variant="outline" />
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/orders/${order.id}/print`}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Link>
        </Button>
      </div>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        orderId={order.id}
        amountDue={order.amountDue}
        onPaymentSuccess={handleSuccess}
      />


    </>
  );
}
