import { getExpenses } from "./actions";
import { ExpensesGrid } from "./grid";

export async function ExpensesTable() {
  const data = await getExpenses();

  return <ExpensesGrid initialData={data} />;
}
