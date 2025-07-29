import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mapping for order status labels
export const orderStatusLabels: Record<string, string> = {
  "PENDING": "Pending",
  "PROCESSING": "Washing",
  "READY_FOR_PICKUP": "Ready",
  "COMPLETED": "Delivered",
  "CANCELLED": "Cancelled"
};

// Mapping for payment status labels
export const paymentStatusLabels: Record<string, string> = {
  "PENDING": "Unpaid",
  "PARTIAL": "Partially Paid",
  "PAID": "Paid"
};

// Helper function to map DB status to user-friendly display status
export const mapStatus = (dbStatus: string, statusMap: Record<string, string>) => {
  return statusMap[dbStatus] || dbStatus;
};

// Function to get order status badge with proper styling
export function getStatusBadge(status: string) {
  const displayStatus = mapStatus(status, orderStatusLabels);
  const variants = {
    "Pending": "bg-red-100 text-red-700",
    "Washing": "bg-blue-100 text-blue-700",
    "Ironing": "bg-yellow-100 text-yellow-700",
    "Ready": "bg-green-100 text-green-700",
    "Delivered": "bg-gray-100 text-gray-700",
    "Cancelled": "bg-slate-100 text-slate-700",
  };
  
  return (
    <Badge 
      className={cn("border-0 font-medium", 
        variants[displayStatus as keyof typeof variants] || "bg-slate-100 text-slate-700"
      )}
    >
      {displayStatus}
    </Badge>
  );
}

// Function to get payment status badge with proper styling
export function getPaymentBadge(status: string) {
  const displayStatus = mapStatus(status, paymentStatusLabels);
  const variants = {
    "Unpaid": "bg-red-100 text-red-700",
    "Partially Paid": "bg-yellow-100 text-yellow-700",
    "Paid": "bg-green-100 text-green-700",
  };

  return (
    <Badge 
      className={cn("border-0 font-medium", 
        variants[displayStatus as keyof typeof variants] || "bg-slate-100 text-slate-700"
      )}
    >
      {displayStatus}
    </Badge>
  );
}
