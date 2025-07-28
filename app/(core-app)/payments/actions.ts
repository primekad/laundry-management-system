"use server";

import { db } from "@/lib/db";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const paymentFormSchema = z.object({
  id: z.string().optional(),
  orderId: z.string(),
  amount: z.coerce.number(),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
});

export async function savePayment(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const validatedFields = paymentFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      errorFields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...paymentData } = validatedFields.data;

  try {
    if (id) {
      await db.payment.update({
        where: { id },
        data: paymentData,
      });
    } else {
      await db.payment.create({
        data: paymentData,
      });
    }
  } catch (e) {
    console.error(e);
    return { error: "Something went wrong" };
  }
  revalidatePath("/payments");
  return { data: null };
}

export async function deletePayment(id: string) {
  try {
    await db.payment.delete({ where: { id } });
    revalidatePath("/payments");
  } catch (e) {
    console.error(e);
    return { error: "Something went wrong" };
  }
}
