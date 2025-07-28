import { db } from '@/lib/db';
import type { Expense, ExpenseWithRelations, ExpenseListItem } from '@/app/(core-app)/expenses/types';

/**
 * Gets an expense by ID with all relations
 */
export async function getExpenseById(expenseId: string): Promise<ExpenseWithRelations | null> {
  try {
    const expense = await db.expense.findUnique({
      where: { id: expenseId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        order: {
          select: {
            id: true,
            invoiceNumber: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!expense) return null;

    return expense as ExpenseWithRelations;
  } catch (error) {
    console.error(`Failed to fetch expense with ID ${expenseId}:`, error);
    throw new Error(`Failed to fetch expense with ID ${expenseId}`);
  }
}

/**
 * Gets all expenses with relations for list display
 */
export async function getAllExpenses(): Promise<ExpenseListItem[]> {
  try {
    const expenses = await db.expense.findMany({
      include: {
        branch: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            invoiceNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return expenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      createdAt: expense.createdAt,
      branch: {
        name: expense.branch.name,
      },
      user: {
        name: expense.user.name,
      },
      category: {
        name: expense.category.name,
      },
      order: expense.order ? {
        invoiceNumber: expense.order.invoiceNumber,
      } : null,
    })) as ExpenseListItem[];
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw new Error('Failed to fetch expenses');
  }
}

/**
 * Gets expenses by branch ID
 */
export async function getExpensesByBranchId(branchId: string): Promise<ExpenseListItem[]> {
  try {
    const expenses = await db.expense.findMany({
      where: { branchId },
      include: {
        branch: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            invoiceNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return expenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      createdAt: expense.createdAt,
      branch: {
        name: expense.branch.name,
      },
      user: {
        name: expense.user.name,
      },
      category: {
        name: expense.category.name,
      },
      order: expense.order ? {
        invoiceNumber: expense.order.invoiceNumber,
      } : null,
    })) as ExpenseListItem[];
  } catch (error) {
    console.error(`Failed to fetch expenses for branch ${branchId}:`, error);
    throw new Error(`Failed to fetch expenses for branch ${branchId}`);
  }
}

/**
 * Gets expenses by category ID
 */
export async function getExpensesByCategoryId(categoryId: string): Promise<ExpenseListItem[]> {
  try {
    const expenses = await db.expense.findMany({
      where: { categoryId },
      include: {
        branch: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            invoiceNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return expenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      createdAt: expense.createdAt,
      branch: {
        name: expense.branch.name,
      },
      user: {
        name: expense.user.name,
      },
      category: {
        name: expense.category.name,
      },
      order: expense.order ? {
        invoiceNumber: expense.order.invoiceNumber,
      } : null,
    })) as ExpenseListItem[];
  } catch (error) {
    console.error(`Failed to fetch expenses for category ${categoryId}:`, error);
    throw new Error(`Failed to fetch expenses for category ${categoryId}`);
  }
}

/**
 * Gets available expense categories
 */
export async function getExpenseCategories() {
  try {
    const categories = await db.expenseCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }));
  } catch (error) {
    console.error('Failed to fetch expense categories:', error);
    throw new Error('Failed to fetch expense categories');
  }
}

/**
 * Gets available branches
 */
export async function getBranches() {
  try {
    const branches = await db.branch.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
    }));
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    throw new Error('Failed to fetch branches');
  }
}

/**
 * Gets available users
 */
export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Gets available orders for expense linking
 */
export async function getAvailableOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
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
    }));
  } catch (error) {
    console.error('Failed to fetch available orders:', error);
    throw new Error('Failed to fetch available orders');
  }
}
