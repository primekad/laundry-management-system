'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';

interface StatusHistoryItem {
  id: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: Date;
}

interface OrderStatusHistoryProps {
  orderId: string;
}

// Helper function for order status badge
const getOrderStatusBadge = (status: OrderStatus) => {
  const variants = {
    PENDING: "bg-red-100 text-red-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    READY_FOR_PICKUP: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-slate-100 text-slate-700",
  };
  
  const labels = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    READY_FOR_PICKUP: "Ready",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  
  return <Badge className={cn("border-0 font-medium text-xs", variants[status])}>{labels[status]}</Badge>;
};

export function OrderStatusHistory({ orderId }: OrderStatusHistoryProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatusHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}/status-history`);
      if (response.ok) {
        const data = await response.json();
        setStatusHistory(data.map((item: any) => ({
          ...item,
          changedAt: new Date(item.changedAt)
        })));
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusHistory();
  }, [orderId]);

  // Listen for order updates to refresh status history
  useEffect(() => {
    const handleOrderUpdate = () => {
      fetchStatusHistory();
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
    };
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Order Status History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-slate-500">Loading status history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Order Status History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {statusHistory.length > 0 ? (
          <div className="space-y-4">
            {statusHistory.map((item) => (
              <div 
                key={item.id}
                className="border border-blue-200 rounded-md p-4 bg-blue-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getOrderStatusBadge(item.previousStatus)}
                    <span className="text-sm text-slate-600">→</span>
                    {getOrderStatusBadge(item.newStatus)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {format(item.changedAt, 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Status changed from <strong>{item.previousStatus.toLowerCase()}</strong> to <strong>{item.newStatus.toLowerCase()}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No status changes recorded yet</p>
        )}
      </CardContent>
    </Card>
  );
}
