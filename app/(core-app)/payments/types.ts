import { PaymentMethod, PaymentStatus } from '@prisma/client';

export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  order?: {
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    totalAmount: number;
  };
};

export type CreatePaymentData = {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
};

export type UpdatePaymentData = {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
};

export type PaymentWithOrder = Payment & {
  order: {
    id: string;
    invoiceNumber: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    totalAmount: number;
  };
};

export type PaymentListItem = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  order: {
    invoiceNumber: string;
    customer: {
      name: string;
    };
  };
};
