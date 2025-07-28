import { db } from '@/lib/db';
import type { CreateExpenseData, UpdateExpenseData, ExpenseWithRelations } from '@/app/(core-app)/expenses/types';
import { getExpenseById } from './expense-queries';

/**
 * Creates a new expense
 */
export async function createExpense(expenseData: CreateExpenseData): Promise<ExpenseWithRelations> {
  try {
    // Validate that the branch exists
    const branch = await db.branch.findUnique({
      where: { id: expenseData.branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Validate that the user exists
    const user = await db.user.findUnique({
      where: { id: expenseData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate that the category exists
    const category = await db.expenseCategory.findUnique({
      where: { id: expenseData.categoryId },
    });

    if (!category) {
      throw new Error('Expense category not found');
    }

    // Validate that the order exists (if provided)
    if (expenseData.orderId) {
      const order = await db.order.findUnique({
        where: { id: expenseData.orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }
    }

    // Create the expense
    const expense = await db.expense.create({
      data: expenseData,
    });

    // Return the expense with relations
    const expenseWithRelations = await getExpenseById(expense.id);
    if (!expenseWithRelations) {
      throw new Error('Failed to retrieve created expense');
    }

    return expenseWithRelations;
  } catch (error) {
    console.error('Error in createExpense command:', error);
    throw new Error('Failed to create expense. Please try again.');
  }
}

/**
 * Updates an existing expense
 */
export async function updateExpense(expenseId: string, expenseData: UpdateExpenseData): Promise<ExpenseWithRelations> {
  try {
    // Validate that the expense exists
    const existingExpense = await db.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    // Validate that the branch exists
    const branch = await db.branch.findUnique({
      where: { id: expenseData.branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Validate that the user exists
    const user = await db.user.findUnique({
      where: { id: expenseData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate that the category exists
    const category = await db.expenseCategory.findUnique({
      where: { id: expenseData.categoryId },
    });

    if (!category) {
      throw new Error('Expense category not found');
    }

    // Validate that the order exists (if provided)
    if (expenseData.orderId) {
      const order = await db.order.findUnique({
        where: { id: expenseData.orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }
    }

    // Update the expense
    await db.expense.update({
      where: { id: expenseId },
      data: expenseData,
    });

    // Return the updated expense with relations
    const updatedExpense = await getExpenseById(expenseId);
    if (!updatedExpense) {
      throw new Error('Failed to retrieve updated expense');
    }

    return updatedExpense;
  } catch (error) {
    console.error('Error in updateExpense command:', error);
    throw new Error('Failed to update expense. Please try again.');
  }
}

/**
 * Deletes an expense
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  try {
    // Validate that the expense exists
    const existingExpense = await db.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    // Delete the expense
    await db.expense.delete({
      where: { id: expenseId },
    });
  } catch (error) {
    console.error('Error in deleteExpense command:', error);
    throw new Error('Failed to delete expense. Please try again.');
  }
}
