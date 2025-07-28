'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setSuccessNotification } from '@/lib/utils/notification-cookies';
import {
  validateCreatePaymentData,
  validateUpdatePaymentData,
  extractCreatePaymentData,
  extractUpdatePaymentData,
  extractFormFields,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  type PaymentActionState,
} from './payment-action-helpers';
import {
  createPayment as createPaymentCommand,
  updatePayment as updatePaymentCommand,
  deletePayment as deletePaymentCommand,
  cancelPayment as cancelPaymentCommand,
} from '@/lib/data/payment-commands';
import { getAllPayments } from '@/lib/data/payment-queries';

export type State = PaymentActionState;

export async function createPayment(prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 createPayment action called');

  // Validate form data
  const validation = validateCreatePaymentData(formData);

  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and create payment data
    const paymentData = extractCreatePaymentData(formData);
    console.log('📝 Creating payment with data:', paymentData);

    const payment = await createPaymentCommand(paymentData);
    console.log('✅ Payment created successfully:', payment.id);

    // Set success notification
    await setSuccessNotification('Payment created successfully');

    // Revalidate and redirect
    revalidatePath('/payments');
  } catch (error) {
    console.error('❌ Create payment action error:', error);

    return createFailureResponse('Failed to create payment. Please try again.', formData);
  }

  // Redirect to the payments list page
  redirect('/payments');
}

export async function updatePayment(id: string, prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 updatePayment action called for ID:', id);

  // Add id to form data for validation
  formData.append('id', id);

  // Validate form data
  const validation = validateUpdatePaymentData(formData);

  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and update payment data
    const paymentData = extractUpdatePaymentData(formData);
    console.log('📝 Updating payment with data:', paymentData);

    const payment = await updatePaymentCommand(id, paymentData);
    console.log('✅ Payment updated successfully:', payment.id);

    // Set success notification
    await setSuccessNotification('Payment updated successfully');

    // Revalidate on success
    revalidatePath('/payments');
  } catch (error) {
    console.error('❌ Update payment action error:', error);

    return createFailureResponse('Failed to update payment. Please try again.', formData);
  }

  // Redirect to the payment view page
  redirect(`/payments/${id}`);
}

export async function deletePayment(id: string): Promise<void> {
  try {
    await deletePaymentCommand(id);

    // Set success notification
    await setSuccessNotification('Payment deleted successfully');

    revalidatePath('/payments');
  } catch (error) {
    console.error('Delete payment action error:', error);
    throw new Error('Failed to delete payment. Please try again.');
  }
}

export async function getPayments() {
  return getAllPayments();
}
