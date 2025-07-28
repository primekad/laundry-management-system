import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExpensesTable } from "./table";

export default function ExpensesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button asChild>
          <Link href="/expenses/create">Add Expense</Link>
        </Button>
      </div>
      <ExpensesTable />
    </div>
  );
}
