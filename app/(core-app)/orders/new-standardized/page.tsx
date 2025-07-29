import { Suspense } from 'react';
import { OrderFormStandardized } from '../order-form-standardized';
import { getOrderFormData } from '../actions-standardized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function OrderFormData() {
  try {
    const { customers, branches, serviceTypes, categories, services, pricingRules } = await getOrderFormData();

    return (
      <OrderFormStandardized
        customers={customers}
        branches={branches}
        serviceTypes={serviceTypes}
        categories={categories}
        services={services}
        pricingRules={pricingRules}
        intent="create"
      />
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load form data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Unable to load the order form. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }
}

function OrderFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-8 w-48" />
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
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function NewOrderStandardizedPage() {
  return (
    <Suspense fallback={<OrderFormSkeleton />}>
      <OrderFormData />
    </Suspense>
  );
}
