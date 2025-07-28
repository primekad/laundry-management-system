// Custom Customer type with additional fields
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  totalOrders: number;
  totalSpent: number;
  amountPaid: number;
  amountToPay: number;
  createdAt: Date;
  updatedAt: Date;
};
