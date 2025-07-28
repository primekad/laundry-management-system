import { db } from '@/lib/db';
import type { CreateCustomerData, UpdateCustomerData, CustomerWithRelations } from '@/app/(core-app)/customers/types';
import { getCustomerById, isEmailTaken } from './customer-queries';

/**
 * Creates a new customer
 */
export async function createCustomer(customerData: CreateCustomerData): Promise<CustomerWithRelations> {
  try {
    // Check if email is already taken
    const emailExists = await isEmailTaken(customerData.email);
    if (emailExists) {
      throw new Error('A customer with this email address already exists');
    }

    // Create the customer
    const customer = await db.customer.create({
      data: customerData,
    });

    // Return the customer with relations
    const customerWithRelations = await getCustomerById(customer.id);
    if (!customerWithRelations) {
      throw new Error('Failed to retrieve created customer');
    }

    return customerWithRelations;
  } catch (error) {
    console.error('Error in createCustomer command:', error);
    if (error instanceof Error && error.message.includes('email address already exists')) {
      throw error; // Re-throw specific validation errors
    }
    throw new Error('Failed to create customer. Please try again.');
  }
}

/**
 * Updates an existing customer
 */
export async function updateCustomer(customerId: string, customerData: UpdateCustomerData): Promise<CustomerWithRelations> {
  try {
    // Validate that the customer exists
    const existingCustomer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Check if email is already taken by another customer
    const emailExists = await isEmailTaken(customerData.email, customerId);
    if (emailExists) {
      throw new Error('A customer with this email address already exists');
    }

    // Update the customer
    await db.customer.update({
      where: { id: customerId },
      data: customerData,
    });

    // Return the updated customer with relations
    const updatedCustomer = await getCustomerById(customerId);
    if (!updatedCustomer) {
      throw new Error('Failed to retrieve updated customer');
    }

    return updatedCustomer;
  } catch (error) {
    console.error('Error in updateCustomer command:', error);
    if (error instanceof Error && (
      error.message.includes('Customer not found') ||
      error.message.includes('email address already exists')
    )) {
      throw error; // Re-throw specific validation errors
    }
    throw new Error('Failed to update customer. Please try again.');
  }
}

/**
 * Deletes a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    // Validate that the customer exists
    const existingCustomer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Check if customer has orders
    if (existingCustomer._count.orders > 0) {
      throw new Error('Cannot delete customer with existing orders. Please delete or reassign orders first.');
    }

    // Delete the customer
    await db.customer.delete({
      where: { id: customerId },
    });
  } catch (error) {
    console.error('Error in deleteCustomer command:', error);
    if (error instanceof Error && (
      error.message.includes('Customer not found') ||
      error.message.includes('Cannot delete customer')
    )) {
      throw error; // Re-throw specific validation errors
    }
    throw new Error('Failed to delete customer. Please try again.');
  }
}
