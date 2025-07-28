import { getExpenseById } from "../actions";
import { ExpenseForm } from "../expense-form";
import { fetchBranches } from "@/lib/data/branches";
import { fetchUsers } from "@/lib/data/users";
import { getExpenseCategories } from "@/app/(core-app)/admin/expense-categories/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const expense = await getExpenseById(params.id);

  if (!expense) {
    return <div>Expense not found</div>;
  }

  const [categories, branches, users] = await Promise.all([
    getExpenseCategories(),
    fetchBranches(),
    fetchUsers(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Expense</h1>
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            expense={expense}
            categories={categories}
            branches={branches}
            users={users}
          />
        </CardContent>
      </Card>
    </div>
  );
}
