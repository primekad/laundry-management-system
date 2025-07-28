'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setSuccessNotification } from '@/lib/utils/notification-cookies';
import {
  validateCreateExpenseData,
  validateUpdateExpenseData,
  extractCreateExpenseData,
  extractUpdateExpenseData,
  extractFormFields,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  type ExpenseActionState,
} from './expense-action-helpers';
import {
  createExpense as createExpenseCommand,
  updateExpense as updateExpenseCommand,
  deleteExpense as deleteExpenseCommand,
} from '@/lib/data/expense-commands';
import { getAllExpenses } from '@/lib/data/expense-queries';

export type State = ExpenseActionState;

export async function createExpense(prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 createExpense action called');

  // Validate form data
  const validation = validateCreateExpenseData(formData);

  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and create expense data
    const expenseData = extractCreateExpenseData(formData);
    console.log('📝 Creating expense with data:', expenseData);

    const expense = await createExpenseCommand(expenseData);
    console.log('✅ Expense created successfully:', expense.id);

    // Set success notification
    await setSuccessNotification('Expense created successfully');

    // Revalidate and redirect
    revalidatePath('/expenses');
  } catch (error) {
    console.error('❌ Create expense action error:', error);

    return createFailureResponse('Failed to create expense. Please try again.', formData);
  }

  // Redirect to the expenses list page
  redirect('/expenses');
}

export async function updateExpense(id: string, prevState: State, formData: FormData): Promise<State> {
  console.log('🚀 updateExpense action called for ID:', id);

  // Add id to form data for validation
  formData.append('id', id);

  // Validate form data
  const validation = validateUpdateExpenseData(formData);

  if (!validation.success) {
    console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and update expense data
    const expenseData = extractUpdateExpenseData(formData);
    console.log('📝 Updating expense with data:', expenseData);

    const expense = await updateExpenseCommand(id, expenseData);
    console.log('✅ Expense updated successfully:', expense.id);

    // Set success notification
    await setSuccessNotification('Expense updated successfully');

    // Revalidate on success
    revalidatePath('/expenses');
  } catch (error) {
    console.error('❌ Update expense action error:', error);

    return createFailureResponse('Failed to update expense. Please try again.', formData);
  }

  // Redirect to the expense view page
  redirect(`/expenses/${id}`);
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await deleteExpenseCommand(id);

    // Set success notification
    await setSuccessNotification('Expense deleted successfully');

    revalidatePath('/expenses');
  } catch (error) {
    console.error('Delete expense action error:', error);
    throw new Error('Failed to delete expense. Please try again.');
  }
}

export async function getExpenses() {
  return getAllExpenses();
}
