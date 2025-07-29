'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setSuccessNotification } from '@/lib/utils/notification-cookies';
import {
  validateCreateOrderData,
  validateUpdateOrderData,
  extractCreateOrderData,
  extractUpdateOrderData,
  extractFormFields,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  type OrderActionState,
} from './order-action-helpers';
import {
  createOrder as createOrderCommand,
  updateOrder as updateOrderCommand,
  deleteOrder as deleteOrderCommand,
} from '@/lib/data/order-commands';
import { getAllOrders } from '@/lib/data/order-queries';

export type State = OrderActionState;

/**
 * Server action to create a new order
 */
export async function createOrder(
  prevState: State,
  formData: FormData
): Promise<State> {
  // Validate the form data
  const validation = validateCreateOrderData(formData);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.errors.forEach((error) => {
      const field = error.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(error.message);
    });

    return createValidationErrorResponse(fieldErrors, formData);
  }

  // Extract validated data
  const orderData = extractCreateOrderData(formData);

  let newOrder;

  try {
    // Create the order
    newOrder = await createOrderCommand(orderData);

    // Set success notification
    await setSuccessNotification('Order created successfully!');

    // Revalidate the orders page
    revalidatePath('/orders');
  } catch (error) {
    console.error('Error in createOrder action:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Customer not found')) {
        return createFailureResponse('Selected customer not found. Please select a valid customer.', formData);
      }
      if (error.message.includes('Branch not found')) {
        return createFailureResponse('Selected branch not found. Please select a valid branch.', formData);
      }
      if (error.message.includes('Invoice number')) {
        return createFailureResponse('Invoice number already exists. Please use a different number.', formData);
      }
    }

    return createFailureResponse('Failed to create order. Please try again.', formData);
  }

  // Redirect outside try-catch block
  redirect(`/orders/${newOrder.id}`);
}

/**
 * Server action to update an existing order
 */
export async function updateOrder(
  orderId: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  // Validate the form data
  const validation = validateUpdateOrderData(formData);

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.errors.forEach((error) => {
      const field = error.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(error.message);
    });

    return createValidationErrorResponse(fieldErrors, formData);
  }

  // Extract validated data
  const orderData = extractUpdateOrderData(formData);

  try {
    // Update the order
    const updatedOrder = await updateOrderCommand(orderId, orderData);

    // Set success notification
    await setSuccessNotification('Order updated successfully!');

    // Revalidate the orders page
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
  } catch (error) {
    console.error('Error in updateOrder action:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Order not found')) {
        return createFailureResponse('Order not found. Please refresh the page and try again.', formData);
      }
      if (error.message.includes('Customer not found')) {
        return createFailureResponse('Selected customer not found. Please select a valid customer.', formData);
      }
      if (error.message.includes('Branch not found')) {
        return createFailureResponse('Selected branch not found. Please select a valid branch.', formData);
      }
    }

    return createFailureResponse('Failed to update order. Please try again.', formData);
  }

  // Redirect outside try-catch block
  redirect(`/orders/${orderId}`);
}

/**
 * Server action to delete an order
 */
export async function deleteOrder(
  orderId: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    // Delete the order
    await deleteOrderCommand(orderId);

    // Set success notification
    await setSuccessNotification('Order deleted successfully!');

    // Revalidate the orders page
    revalidatePath('/orders');
  } catch (error) {
    console.error('Error in deleteOrder action:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Order not found')) {
        return createFailureResponse('Order not found. It may have already been deleted.', formData);
      }
    }

    return createFailureResponse('Failed to delete order. Please try again.', formData);
  }

  // Redirect outside try-catch block
  redirect('/orders');
}

/**
 * Server action to get all orders (for form dropdowns, etc.)
 */
export async function getOrdersForSelect() {
  try {
    const orders = await getAllOrders();
    return orders.map(order => ({
      id: order.id,
      label: `${order.invoiceNumber} - ${order.customer?.name || 'Unknown Customer'}`,
      invoiceNumber: order.invoiceNumber,
      customer: order.customer,
      totalAmount: order.totalAmount,
    }));
  } catch (error) {
    console.error('Error in getOrdersForSelect action:', error);
    throw new Error('Failed to fetch orders for selection');
  }
}

/**
 * Server action to validate invoice number uniqueness
 */
export async function validateInvoiceNumber(
  invoiceNumber: string,
  excludeOrderId?: string
): Promise<{ isValid: boolean; message?: string }> {
  try {
    if (!invoiceNumber.trim()) {
      return { isValid: true }; // Empty is valid (will auto-generate)
    }

    // Import here to avoid circular dependencies
    const { isInvoiceNumberTaken } = await import('@/lib/data/order-queries');
    const isTaken = await isInvoiceNumberTaken(invoiceNumber, excludeOrderId);
    
    if (isTaken) {
      return {
        isValid: false,
        message: 'This invoice number is already in use. Please choose a different number.',
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error in validateInvoiceNumber action:', error);
    return {
      isValid: false,
      message: 'Unable to validate invoice number. Please try again.',
    };
  }
}

/**
 * Server action to get available data for order forms
 */
export async function getOrderFormData() {
  try {
    // Import here to avoid circular dependencies
    const { getAvailableCustomers, getAvailableBranches, getAvailableServiceTypes } =
      await import('@/lib/data/order-queries');

    // Import additional data needed for the form
    const { db } = await import('@/lib/db');

    const [customers, branches, serviceTypes, categories, services, pricingRules] = await Promise.all([
      getAvailableCustomers(),
      getAvailableBranches(),
      getAvailableServiceTypes(),
      // Get laundry categories
      db.laundryCategory.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      }),
      // Get services (same as serviceTypes for compatibility)
      db.serviceType.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      }),
      // Get pricing rules
      db.pricingRule.findMany({
        include: {
          laundryCategory: true,
          serviceType: true,
        },
      }),
    ]);

    return {
      customers,
      branches,
      serviceTypes,
      categories,
      services,
      pricingRules,
    };
  } catch (error) {
    console.error('Error in getOrderFormData action:', error);
    throw new Error('Failed to fetch form data');
  }
}

/**
 * Server action to search customers (for CustomerSearch component)
 */
export async function searchCustomers(query: string) {
  try {
    const { db } = await import('@/lib/db');

    // Allow empty query to return all customers (limited to 10)
    if (!query) {
      const customers = await db.customer.findMany({
        take: 10,
        orderBy: { name: 'asc' },
      });
      return customers;
    }

    // Search customers by name, phone, or email
    const customers = await db.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    return customers;
  } catch (error) {
    console.error('Error in searchCustomers action:', error);
    throw new Error('Failed to search customers');
  }
}
