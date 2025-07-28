'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditOrderDialog } from '@/components/edit-order-dialog';
import { OrderStatus } from '@prisma/client';

interface EditOrderButtonProps {
  order: {
    id: string;
    status: OrderStatus;
    notes?: string | null;
    expectedDeliveryDate?: string | null;
  };
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'secondary';
  iconOnly?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function EditOrderButton({ 
  order, 
  variant = 'outline',
  iconOnly = false,
  size,
  className
}: EditOrderButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => {setDialogOpen(true)
          console.log("open")
        }}
      >
        <Edit className={`h-4 w-4 ${!iconOnly ? 'mr-2' : ''}`} />
        {!iconOnly && 'Edit Order'}
      </Button>

      <EditOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={order}
        onEditSuccess={handleSuccess}
      />
    </>
  );
}
