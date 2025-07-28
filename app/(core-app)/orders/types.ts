export type Order = {
  id: string;
  invoiceNumber: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
  } | null;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  notes?: string | null;
  expectedDeliveryDate?: string | null;
  branchId?: string;
};
