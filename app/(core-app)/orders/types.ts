import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

// Base order type from database (matching updated Prisma schema)
export type BaseOrder = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  branchId: string;
  notes: string | null;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: Date | null;
  expectedDeliveryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Order with relations for detailed views
export type OrderWithRelations = BaseOrder & {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  branch: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  };
  items: OrderItemWithRelations[];
  payments: {
    id: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId: string | null;
    createdAt: Date;
  }[];
};

// Order item with relations
export type OrderItemWithRelations = {
  id: string;
  orderId: string;
  serviceTypeId: string;
  categoryId: string | null;
  quantity: number;
  size: string;
  notes: string;
  price: number;
  subtotal: number;
  serviceType: {
    id: string;
    name: string;
    description: string | null;
  };
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

// Order list item for table display (matching updated schema)
export type OrderListItem = {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  branch: {
    id: string;
    name: string;
  } | null;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  orderDate: Date | null;
  expectedDeliveryDate: Date | null;
  createdAt: Date;
  _count: {
    items: number;
    payments: number;
  };
};

// Data types for creating orders (matching updated schema)
export type CreateOrderData = {
  customerId: string;
  branchId: string;
  notes?: string;
  discount?: number; // Now stored in DB
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  customInvoiceNumber?: string;
  orderDate?: string; // Now stored in DB
  expectedDeliveryDate?: string; // Now stored in DB
  items: CreateOrderItemData[];
};

export type CreateOrderItemData = {
  serviceTypeId: string;
  categoryId?: string;
  quantity: number;
  size?: string;
  notes?: string;
  unitPrice: number;
  total: number;
};

// Data types for updating orders (matching updated schema)
export type UpdateOrderData = {
  customerId?: string;
  branchId?: string;
  notes?: string;
  status?: OrderStatus;
  discount?: number; // Now stored in DB
  orderDate?: string; // Now stored in DB
  expectedDeliveryDate?: string; // Now stored in DB
  items?: CreateOrderItemData[];
};

// Legacy type for backward compatibility
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
