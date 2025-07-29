import { db } from '@/lib/db';
import type { OrderWithRelations, OrderListItem, BaseOrder } from '@/app/(core-app)/orders/types';

/**
 * Gets an order by ID with all relations
 */
export async function getOrderById(orderId: string): Promise<OrderWithRelations | null> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            serviceType: true,
            category: true,
          },
        },
        payments: true,
        branch: true,
      },
    });

    if (!order) return null;

    return order as OrderWithRelations;
  } catch (error) {
    console.error(`Failed to fetch order with ID ${orderId}:`, error);
    throw new Error(`Failed to fetch order with ID ${orderId}`);
  }
}

/**
 * Gets all orders with customer and branch details for list display
 */
export async function getAllOrders(): Promise<OrderListItem[]> {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            payments: true,
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
      branch: order.branch,
      totalAmount: order.totalAmount,
      amountPaid: order.amountPaid,
      amountDue: order.amountDue,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      discount: order.discount,
      orderDate: order.orderDate,
      expectedDeliveryDate: order.expectedDeliveryDate,
      createdAt: order.createdAt,
      _count: {
        items: order._count.items,
        payments: order._count.payments,
      },
    })) as OrderListItem[];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw new Error('Failed to fetch orders');
  }
}

/**
 * Gets orders by status
 */
export async function getOrdersByStatus(status: string): Promise<OrderListItem[]> {
  try {
    const orders = await db.order.findMany({
      where: { status: status as any },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            payments: true,
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
      branch: order.branch,
      totalAmount: order.totalAmount,
      amountPaid: order.amountPaid,
      amountDue: order.amountDue,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      orderDate: null, // Not stored in DB, will be handled in frontend
      expectedDeliveryDate: null, // Not stored in DB, will be handled in frontend
      createdAt: order.createdAt,
      _count: {
        items: order._count.items,
        payments: order._count.payments,
      },
    })) as OrderListItem[];
  } catch (error) {
    console.error(`Failed to fetch orders by status ${status}:`, error);
    throw new Error(`Failed to fetch orders by status ${status}`);
  }
}

/**
 * Gets orders by customer ID
 */
export async function getOrdersByCustomerId(customerId: string): Promise<BaseOrder[]> {
  try {
    const orders = await db.order.findMany({
      where: { customerId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders as BaseOrder[];
  } catch (error) {
    console.error(`Failed to fetch orders for customer ${customerId}:`, error);
    throw new Error(`Failed to fetch orders for customer ${customerId}`);
  }
}

/**
 * Gets available customers for order creation
 */
export async function getAvailableCustomers() {
  try {
    const customers = await db.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers;
  } catch (error) {
    console.error('Failed to fetch available customers:', error);
    throw new Error('Failed to fetch available customers');
  }
}

/**
 * Gets available branches for order creation
 */
export async function getAvailableBranches() {
  try {
    const branches = await db.branch.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return branches;
  } catch (error) {
    console.error('Failed to fetch available branches:', error);
    throw new Error('Failed to fetch available branches');
  }
}

/**
 * Gets available service types for order items
 */
export async function getAvailableServiceTypes() {
  try {
    const serviceTypes = await db.serviceType.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serviceTypes;
  } catch (error) {
    console.error('Failed to fetch available service types:', error);
    throw new Error('Failed to fetch available service types');
  }
}

/**
 * Checks if an invoice number is already taken
 */
export async function isInvoiceNumberTaken(invoiceNumber: string, excludeOrderId?: string): Promise<boolean> {
  try {
    const existingOrder = await db.order.findFirst({
      where: {
        invoiceNumber,
        ...(excludeOrderId && { id: { not: excludeOrderId } }),
      },
    });

    return !!existingOrder;
  } catch (error) {
    console.error('Failed to check invoice number availability:', error);
    throw new Error('Failed to check invoice number availability');
  }
}
