import { getExpenseCategories } from "./actions";
import { ExpenseCategoriesClient } from "./client";

export default async function ExpenseCategoriesPage() {
  const categories = await getExpenseCategories();

  return <ExpenseCategoriesClient categories={categories} />;
}
