'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setSuccessNotification } from '@/lib/utils/notification-cookies';
import {
  validateCreateCustomerData,
  validateUpdateCustomerData,
  extractCreateCustomerData,
  extractUpdateCustomerData,
  extractFormFields,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  type CustomerActionState,
} from './customer-action-helpers';
import {
  createCustomer as createCustomerCommand,
  updateCustomer as updateCustomerCommand,
  deleteCustomer as deleteCustomerCommand,
} from '@/lib/data/customer-commands';
import { getAllCustomers } from '@/lib/data/customer-queries';

export type State = CustomerActionState;

export async function createCustomer(prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 createCustomer action called');
  
  // Validate form data
  const validation = validateCreateCustomerData(formData);
  
  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and create customer data
    const customerData = extractCreateCustomerData(formData);
    console.log('📝 Creating customer with data:', customerData);
    
    const customer = await createCustomerCommand(customerData);
    console.log('✅ Customer created successfully:', customer.id);
    
    // Set success notification
    await setSuccessNotification('Customer created successfully');
    
    // Revalidate and redirect
    revalidatePath('/customers');
  } catch (error) {
    console.error('❌ Create customer action error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error && error.message.includes('email address already exists')) {
      return createValidationErrorResponse(
        { email: ['A customer with this email address already exists'] },
        formData
      );
    }
    
    return createFailureResponse('Failed to create customer. Please try again.', formData);
  }

  // Redirect to the customers list page
  redirect('/customers');
}

export async function updateCustomer(id: string, prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 updateCustomer action called for ID:', id);
  
  // Add id to form data for validation
  formData.append('id', id);
  
  // Validate form data
  const validation = validateUpdateCustomerData(formData);
  
  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and update customer data
    const customerData = extractUpdateCustomerData(formData);
    console.log('📝 Updating customer with data:', customerData);
    
    const customer = await updateCustomerCommand(id, customerData);
    console.log('✅ Customer updated successfully:', customer.id);
    
    // Set success notification
    await setSuccessNotification('Customer updated successfully');
    
    // Revalidate on success
    revalidatePath('/customers');
  } catch (error) {
    console.error('❌ Update customer action error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Customer not found')) {
        return createFailureResponse('Customer not found.', formData);
      }
      if (error.message.includes('email address already exists')) {
        return createValidationErrorResponse(
          { email: ['A customer with this email address already exists'] },
          formData
        );
      }
    }
    
    return createFailureResponse('Failed to update customer. Please try again.', formData);
  }

  // Redirect to the customer view page
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    await deleteCustomerCommand(id);
    
    // Set success notification
    await setSuccessNotification('Customer deleted successfully');
    
    revalidatePath('/customers');
  } catch (error) {
    console.error('Delete customer action error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Customer not found')) {
        throw new Error('Customer not found.');
      }
      if (error.message.includes('Cannot delete customer')) {
        throw new Error('Cannot delete customer with existing orders. Please delete or reassign orders first.');
      }
    }
    
    throw new Error('Failed to delete customer. Please try again.');
  }
}

export async function getCustomers() {
  return getAllCustomers();
}
