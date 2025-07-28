import { getExpenseCategoryById, updateExpenseCategory } from "../actions";
import { CategoryForm } from "../category-form";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getExpenseCategoryById(params.id);

  if (!category) {
    return <div>Category not found</div>;
  }

  const updateAction = updateExpenseCategory.bind(null, category.id);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Expense Category</h1>
      <CategoryForm category={category} action={updateAction} />
    </div>
  );
}
