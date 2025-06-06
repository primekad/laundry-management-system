export interface User {
  id: string
  firstName: string
  surname: string
  email: string
  phoneNumber?: string
  role: UserRole
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export type UserRole = "Admin" | "Manager" | "Staff" | "PublicUser"

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

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid"
export type OrderStatus = "Pending" | "Washing" | "Ironing" | "Ready" | "Delivered" | "Cancelled"

export interface Expense {
  id: string
  date: string
  title: string
  category: ExpenseCategory
  amount: number
  paidTo?: string
  linkedOrderId?: string
  description?: string
  recordedBy: string
  createdAt: string
}

export type ExpenseCategory = "Supplies" | "Utilities" | "Maintenance" | "Payroll" | "Marketing" | "Other"

export interface PriceRule {
  id: string
  itemType: string
  serviceType: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalRevenue: number
  ordersThisMonth: number
  outstandingPayments: number
  expensesThisMonth: number
  revenueGrowth: number
  ordersGrowth: number
}
