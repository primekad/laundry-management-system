import { ExpenseFormStandardized as ExpenseForm } from '../../expense-form-standardized';
import { 
  getExpenseById,
  getExpenseCategories, 
  getBranches, 
  getUsers, 
  getAvailableOrders 
} from '@/lib/data/expense-queries';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const [expense, categories, branches, users, orders] = await Promise.all([
    getExpenseById(params.id),
    getExpenseCategories(),
    getBranches(),
    getUsers(),
    getAvailableOrders(),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Expenses', href: '/expenses' },
          { label: 'Expense Details', href: `/expenses/${expense.id}` },
          { label: 'Edit Expense', href: `/expenses/${expense.id}/edit`, active: true },
        ]}
      />
      <ExpenseForm 
        expense={expense} 
        categories={categories}
        branches={branches}
        users={users}
        orders={orders}
        intent="edit" 
      />
    </main>
  );
}
