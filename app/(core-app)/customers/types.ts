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

// Base customer type from database
export type BaseCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCustomerData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export type UpdateCustomerData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export type CustomerWithRelations = BaseCustomer & {
  orders: Order[];
};

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
  _count: {
    orders: number;
  };
};

export type Order = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
