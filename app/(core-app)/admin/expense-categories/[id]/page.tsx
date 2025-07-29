import {getExpenseCategoryById} from "../actions";


export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getExpenseCategoryById(params.id);

  if (!category) {
    return <div>Category not found</div>;
  }


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Expense Category</h1>
    </div>
  );
}
