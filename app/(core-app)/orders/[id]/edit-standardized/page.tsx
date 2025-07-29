import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { OrderFormStandardized } from '../../order-form-standardized';
import { getOrderFormData } from '../../actions-standardized';
import { getOrderById } from '@/lib/data/order-queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EditOrderStandardizedPageProps {
  params: { id: string };
}

async function EditOrderFormData({ orderId }: { orderId: string }) {
  try {
    const [order, { customers, branches, serviceTypes, categories, services, pricingRules }] = await Promise.all([
      getOrderById(orderId),
      getOrderFormData(),
    ]);

    if (!order) {
      notFound();
    }

    return (
      <OrderFormStandardized
        order={order}
        customers={customers}
        branches={branches}
        serviceTypes={serviceTypes}
        categories={categories}
        services={services}
        pricingRules={pricingRules}
        intent="edit"
      />
    );
  } catch (error) {
    console.error('Error loading order data:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load order data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Unable to load the order for editing. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }
}

function EditOrderFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function EditOrderStandardizedPage({ params }: EditOrderStandardizedPageProps) {
  return (
    <Suspense fallback={<EditOrderFormSkeleton />}>
      <EditOrderFormData orderId={params.id} />
    </Suspense>
  );
}
