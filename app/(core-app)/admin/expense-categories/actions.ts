"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ExpenseCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const UpdateExpenseCategorySchema = ExpenseCategorySchema.extend({
  id: z.string(),
});

export async function createExpenseCategory(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = ExpenseCategorySchema.parse(data);
    await db.expenseCategory.create({ data: validatedData });
    revalidatePath("/admin/expense-categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create expense category." };
  }
}

export async function getExpenseCategories() {
  return db.expenseCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getExpenseCategoryById(id: string) {
  return db.expenseCategory.findUnique({ where: { id } });
}

export async function updateExpenseCategory(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const { id, ...updateData } = UpdateExpenseCategorySchema.parse(data);
    await db.expenseCategory.update({ where: { id }, data: updateData });
    revalidatePath("/admin/expense-categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update expense category." };
  }
}

export async function deleteExpenseCategory(id: string) {
  try {
    await db.expenseCategory.delete({ where: { id } });
    revalidatePath("/admin/expense-categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense category." };
  }
}
