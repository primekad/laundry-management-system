export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  receiptUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  branchId: string;
  userId: string;
  categoryId: string;
  orderId?: string | null;
  branch?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    description?: string | null;
  };
  order?: {
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
    };
  } | null;
};

export type CreateExpenseData = {
  description: string;
  amount: number;
  date: Date;
  branchId: string;
  userId: string;
  categoryId: string;
  orderId?: string;
  receiptUrl?: string;
};

export type UpdateExpenseData = {
  description: string;
  amount: number;
  date: Date;
  branchId: string;
  userId: string;
  categoryId: string;
  orderId?: string;
  receiptUrl?: string;
};

export type ExpenseWithRelations = Expense & {
  branch: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    description?: string | null;
  };
  order?: {
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
    };
  } | null;
};

export type ExpenseListItem = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  createdAt: Date;
  branch: {
    name: string;
  };
  user: {
    name: string;
  };
  category: {
    name: string;
  };
  order?: {
    invoiceNumber: string;
  } | null;
};
