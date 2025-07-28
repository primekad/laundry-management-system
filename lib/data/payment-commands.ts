import { db } from '@/lib/db';
import type { CreatePaymentData, UpdatePaymentData, PaymentWithOrder } from '@/app/(core-app)/payments/types';
import { getPaymentById } from './payment-queries';

/**
 * Creates a new payment
 */
export async function createPayment(paymentData: CreatePaymentData): Promise<PaymentWithOrder> {
  try {
    // Validate that the order exists
    const order = await db.order.findUnique({
      where: { id: paymentData.orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create the payment
    const payment = await db.payment.create({
      data: paymentData,
    });

    // Return the payment with order details
    const paymentWithOrder = await getPaymentById(payment.id);
    if (!paymentWithOrder) {
      throw new Error('Failed to retrieve created payment');
    }

    return paymentWithOrder;
  } catch (error) {
    console.error('Error in createPayment command:', error);
    throw new Error('Failed to create payment. Please try again.');
  }
}

/**
 * Updates an existing payment
 */
export async function updatePayment(paymentId: string, paymentData: UpdatePaymentData): Promise<PaymentWithOrder> {
  try {
    // Validate that the payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Validate that the order exists
    const order = await db.order.findUnique({
      where: { id: paymentData.orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update the payment
    await db.payment.update({
      where: { id: paymentId },
      data: paymentData,
    });

    // Return the updated payment with order details
    const updatedPayment = await getPaymentById(paymentId);
    if (!updatedPayment) {
      throw new Error('Failed to retrieve updated payment');
    }

    return updatedPayment;
  } catch (error) {
    console.error('Error in updatePayment command:', error);
    throw new Error('Failed to update payment. Please try again.');
  }
}

/**
 * Deletes a payment
 */
export async function deletePayment(paymentId: string): Promise<void> {
  try {
    // Validate that the payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Delete the payment
    await db.payment.delete({
      where: { id: paymentId },
    });
  } catch (error) {
    console.error('Error in deletePayment command:', error);
    throw new Error('Failed to delete payment. Please try again.');
  }
}

/**
 * Soft delete by updating status to FAILED
 */
export async function cancelPayment(paymentId: string): Promise<PaymentWithOrder> {
  try {
    const existingPayment = await getPaymentById(paymentId);
    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    // Update status to FAILED
    await db.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });

    // Return the updated payment
    const updatedPayment = await getPaymentById(paymentId);
    if (!updatedPayment) {
      throw new Error('Failed to retrieve updated payment');
    }

    return updatedPayment;
  } catch (error) {
    console.error('Error in cancelPayment command:', error);
    throw new Error('Failed to cancel payment. Please try again.');
  }
}
