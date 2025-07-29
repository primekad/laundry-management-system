import { getLaundryCategories } from "./actions";
import { LaundryCategoriesClient } from "./client";

export default async function LaundryCategoriesPage() {
  const laundryCategories = await getLaundryCategories();

  return <LaundryCategoriesClient laundryCategories={laundryCategories} />;
}
