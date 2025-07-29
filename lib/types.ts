import type {
  Role,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from "@prisma/client";

export interface User {
  id: string;
  firstName?: string | null;
  surname?: string | null;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  phoneNumber?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface Order {
  id: string
  invoiceNumber: string
  customer: Customer
  orderDate: string
  expectedDeliveryDate: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  amountPaid: number
  balance: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdBy: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  itemType: string
  serviceTypes: string[]
  quantity: number
  color?: string
  label?: string
  unitPrice: number
  totalPrice: number
}



export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  receiptUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: string;

  category: ExpenseCategory;
  categoryId: string;

  branch: Branch;
  branchId: string;

  orderId?: string | null;
  order?: Order | null;
}

export interface PriceRule {
  id: string
  itemType: string
  serviceType: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string;
  orderId: string;
  order: Order;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number
  ordersThisMonth: number
  outstandingPayments: number
  expensesThisMonth: number
  revenueGrowth: number
  ordersGrowth: number
}
