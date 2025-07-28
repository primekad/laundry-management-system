'use client';

import Link from 'next/link';
import { Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditOrderButton } from '@/components/edit-order-button';
import { OrderStatus } from '@prisma/client';

interface OrderGridActionsProps {
  order: {
    id: string;
    status: OrderStatus;
    notes?: string | null;
    expectedDeliveryDate?: string | null;
  };
}

export function OrderGridActions({ order }: OrderGridActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
        asChild
      >
        <Link href={`/orders/${order.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      
      <EditOrderButton 
        order={order}
        variant="ghost"
        iconOnly
        size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
      />
      
      <Button
        variant="ghost"
        size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-8 w-8 p-0"
        asChild
      >
        <Link href={`/orders/${order.id}/print`}>
          <Printer className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
