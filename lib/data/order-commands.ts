import { db } from '@/lib/db';
import type { CreateOrderData, UpdateOrderData, OrderWithRelations } from '@/app/(core-app)/orders/types';
import { getOrderById } from './order-queries';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

/**
 * Creates a new order with items and initial payment
 */
export async function createOrder(orderData: CreateOrderData): Promise<OrderWithRelations> {
  try {
    // Validate that the customer exists
    const customer = await db.customer.findUnique({
      where: { id: orderData.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Validate that the branch exists
    const branch = await db.branch.findUnique({
      where: { id: orderData.branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Calculate totals (note: discount is handled in the frontend, not stored in DB)
    const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
    const discount = orderData.discount || 0;
    const totalAmount = subtotal - discount; // Apply discount to total
    const amountPaid = orderData.amountPaid || 0;
    const amountDue = totalAmount - amountPaid;

    // Determine payment status
    let paymentStatus: PaymentStatus;
    if (amountPaid <= 0) {
      paymentStatus = PaymentStatus.PENDING;
    } else if (amountPaid >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    // Generate invoice number if not provided
    let invoiceNumber = orderData.customInvoiceNumber;
    if (!invoiceNumber) {
      const lastOrder = await db.order.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { invoiceNumber: true },
      });
      
      const lastNumber = lastOrder?.invoiceNumber ? 
        parseInt(lastOrder.invoiceNumber.replace(/\D/g, '')) || 0 : 0;
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
    }

    // Create the order with related items and payment in a transaction
    const order = await db.$transaction(async (prisma) => {
      // Create the order (now with all fields including dates and discount)
      const newOrder = await prisma.order.create({
        data: {
          invoiceNumber,
          customerId: orderData.customerId,
          branchId: orderData.branchId,
          notes: orderData.notes || '',
          totalAmount,
          amountPaid,
          amountDue,
          discount: orderData.discount || 0,
          status: OrderStatus.PENDING,
          paymentStatus,
          orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
          expectedDeliveryDate: orderData.expectedDeliveryDate ?
            new Date(orderData.expectedDeliveryDate) : null,
        },
      });

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        await prisma.orderItem.createMany({
          data: orderData.items.map(item => ({
            orderId: newOrder.id,
            serviceTypeId: item.serviceTypeId,
            categoryId: item.categoryId,
            quantity: item.quantity,
            size: item.size || '',
            notes: item.notes || '',
            price: item.unitPrice,
            subtotal: item.total,
          })),
        });
      }

      // Create initial payment if amount is greater than 0
      if (amountPaid > 0 && orderData.paymentMethod) {
        await prisma.payment.create({
          data: {
            orderId: newOrder.id,
            amount: amountPaid,
            paymentMethod: orderData.paymentMethod as PaymentMethod,
            status: PaymentStatus.PAID,
          },
        });
      }

      return newOrder;
    });

    // Return the order with relations
    const orderWithRelations = await getOrderById(order.id);
    if (!orderWithRelations) {
      throw new Error('Failed to retrieve created order');
    }

    return orderWithRelations;
  } catch (error) {
    console.error('Error in createOrder command:', error);
    throw new Error('Failed to create order. Please try again.');
  }
}

/**
 * Updates an existing order
 */
export async function updateOrder(orderId: string, orderData: UpdateOrderData): Promise<OrderWithRelations> {
  try {
    // Validate that the order exists
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Validate customer if provided
    if (orderData.customerId) {
      const customer = await db.customer.findUnique({
        where: { id: orderData.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
    }

    // Validate branch if provided
    if (orderData.branchId) {
      const branch = await db.branch.findUnique({
        where: { id: orderData.branchId },
      });

      if (!branch) {
        throw new Error('Branch not found');
      }
    }

    // Calculate new totals if items are provided
    let totalAmount = existingOrder.totalAmount;
    let amountDue = existingOrder.amountDue;

    if (orderData.items) {
      const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0);
      const discount = orderData.discount || existingOrder.discount || 0;
      totalAmount = subtotal - discount;
      const totalPayments = existingOrder.payments.reduce((sum, payment) => sum + payment.amount, 0);
      amountDue = totalAmount - totalPayments;
    }

    // Determine payment status
    const totalPayments = existingOrder.payments.reduce((sum, payment) => sum + payment.amount, 0);
    let paymentStatus: PaymentStatus;
    if (totalPayments <= 0) {
      paymentStatus = PaymentStatus.PENDING;
    } else if (totalPayments >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    // Update the order in a transaction
    const updatedOrder = await db.$transaction(async (prisma) => {
      // Update the order (now with all fields including dates and discount)
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(orderData.customerId && { customerId: orderData.customerId }),
          ...(orderData.branchId && { branchId: orderData.branchId }),
          ...(orderData.notes !== undefined && { notes: orderData.notes }),
          ...(orderData.status && { status: orderData.status as OrderStatus }),
          ...(orderData.discount !== undefined && { discount: orderData.discount }),
          ...(orderData.orderDate && { orderDate: new Date(orderData.orderDate) }),
          ...(orderData.expectedDeliveryDate && {
            expectedDeliveryDate: new Date(orderData.expectedDeliveryDate)
          }),
          totalAmount,
          amountDue,
          paymentStatus,
          updatedAt: new Date(),
        },
      });

      // Update items if provided
      if (orderData.items) {
        // Delete existing items
        await prisma.orderItem.deleteMany({
          where: { orderId },
        });

        // Create new items
        if (orderData.items.length > 0) {
          await prisma.orderItem.createMany({
            data: orderData.items.map(item => ({
              orderId,
              serviceTypeId: item.serviceTypeId,
              categoryId: item.categoryId,
              quantity: item.quantity,
              size: item.size || '',
              notes: item.notes || '',
              price: item.unitPrice,
              subtotal: item.total,
            })),
          });
        }
      }

      return order;
    });

    // Return the updated order with relations
    const orderWithRelations = await getOrderById(updatedOrder.id);
    if (!orderWithRelations) {
      throw new Error('Failed to retrieve updated order');
    }

    return orderWithRelations;
  } catch (error) {
    console.error('Error in updateOrder command:', error);
    throw new Error('Failed to update order. Please try again.');
  }
}

/**
 * Deletes an order and all related data
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    // Validate that the order exists
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Delete the order and all related data in a transaction
    await db.$transaction(async (prisma) => {
      // Delete payments
      await prisma.payment.deleteMany({
        where: { orderId },
      });

      // Delete order items
      await prisma.orderItem.deleteMany({
        where: { orderId },
      });

      // Delete the order
      await prisma.order.delete({
        where: { id: orderId },
      });
    });
  } catch (error) {
    console.error('Error in deleteOrder command:', error);
    throw new Error('Failed to delete order. Please try again.');
  }
}
