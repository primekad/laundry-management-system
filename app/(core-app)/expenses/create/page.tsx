import { getExpenseCategories } from "../../admin/expense-categories/actions";
import { ExpenseForm } from "../expense-form";
import { fetchBranches } from "@/lib/data/branches";
import { fetchUsers } from "@/lib/data/users";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CreateExpensePage() {
  const [categories, branches, users] = await Promise.all([
    getExpenseCategories(),
    fetchBranches(),
    fetchUsers(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create Expense</h1>
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm categories={categories} branches={branches} users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
