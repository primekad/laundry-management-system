import { ExpenseFormStandardized as ExpenseForm } from '../expense-form-standardized';
import {
  getExpenseCategories,
  getBranches,
  getUsers,
  getAvailableOrders
} from '@/lib/data/expense-queries';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function CreateExpensePage() {
  const [categories, branches, users, orders] = await Promise.all([
    getExpenseCategories(),
    getBranches(),
    getUsers(),
    getAvailableOrders(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Expenses',
            href: '/expenses',
          },
          {
            label: 'Create Expense',
            href: '/expenses/create',
            active: true,
          },
        ]}
      />
      <ExpenseForm
        categories={categories}
        branches={branches}
        users={users}
        orders={orders}
        intent="create"
      />
    </main>
  );
}
