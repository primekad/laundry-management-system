"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ExpenseSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.coerce.date(),
  categoryId: z.string().min(1, "Category is required"),
  branchId: z.string().min(1, "Branch is required"),
  userId: z.string(),
  orderId: z.string().optional().nullable(),
});

export async function createExpense(data: unknown) {
  const validatedData = ExpenseSchema.parse(data);
  await db.expense.create({ data: validatedData });
  revalidatePath("/expenses");
}

export async function updateExpense(id: string, data: unknown) {
  const validatedData = ExpenseSchema.parse(data);
  await db.expense.update({ where: { id }, data: validatedData });
  revalidatePath("/expenses");
  revalidatePath(`/expenses/${id}`);
}

export async function deleteExpense(id: string) {
  await db.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}

export async function getExpenses() {
  return db.expense.findMany({
    include: {
      user: true,
      category: true,
      branch: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function getExpenseById(id: string) {
  return db.expense.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
      branch: true,
    },
  });
}
