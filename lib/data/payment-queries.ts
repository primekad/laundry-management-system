import { db } from '@/lib/db';
import type { Payment, PaymentWithOrder, PaymentListItem } from '@/app/(core-app)/payments/types';

/**
 * Gets a payment by ID with order details
 */
export async function getPaymentById(paymentId: string): Promise<PaymentWithOrder | null> {
  try {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) return null;

    return {
      ...payment,
      order: {
        id: payment.order.id,
        invoiceNumber: payment.order.invoiceNumber,
        customer: payment.order.customer,
        totalAmount: payment.order.totalAmount,
      },
    } as PaymentWithOrder;
  } catch (error) {
    console.error(`Failed to fetch payment with ID ${paymentId}:`, error);
    throw new Error(`Failed to fetch payment with ID ${paymentId}`);
  }
}

/**
 * Gets all payments with order and customer details
 */
export async function getAllPayments(): Promise<PaymentListItem[]> {
  try {
    const payments = await db.payment.findMany({
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      order: {
        invoiceNumber: payment.order.invoiceNumber,
        customer: {
          name: payment.order.customer.name,
        },
      },
    })) as PaymentListItem[];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw new Error('Failed to fetch payments');
  }
}

/**
 * Gets payments by order ID
 */
export async function getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
  try {
    const payments = await db.payment.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments as Payment[];
  } catch (error) {
    console.error(`Failed to fetch payments for order ${orderId}:`, error);
    throw new Error(`Failed to fetch payments for order ${orderId}`);
  }
}

/**
 * Gets payments by status
 */
export async function getPaymentsByStatus(status: string): Promise<PaymentListItem[]> {
  try {
    const payments = await db.payment.findMany({
      where: { status: status as any },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      order: {
        invoiceNumber: payment.order.invoiceNumber,
        customer: {
          name: payment.order.customer.name,
        },
      },
    })) as PaymentListItem[];
  } catch (error) {
    console.error(`Failed to fetch payments with status ${status}:`, error);
    throw new Error(`Failed to fetch payments with status ${status}`);
  }
}

/**
 * Gets available orders for payment creation
 */
export async function getAvailableOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      customer: order.customer,
      totalAmount: order.totalAmount,
    }));
  } catch (error) {
    console.error('Failed to fetch available orders:', error);
    throw new Error('Failed to fetch available orders');
  }
}
