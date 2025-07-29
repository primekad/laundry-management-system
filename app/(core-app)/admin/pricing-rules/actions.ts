"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/lib/db";
import { z } from "zod";
import { UnitOfMeasurement } from "@prisma/client";

const PricingRuleSchema = z.object({
  id: z.string().optional(),
  laundryCategoryId: z.string().min(1, "Category is required"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  price: z.coerce.number().optional().nullable(),
  minPrice: z.coerce.number().optional().nullable(),
  maxPrice: z.coerce.number().optional().nullable(),
  unitOfMeasurement: z.nativeEnum(UnitOfMeasurement).optional().nullable(),
  sizeBasedRates: z.string().optional().nullable(),
});

const CreatePricingRuleSchema = PricingRuleSchema.omit({ id: true });
const UpdatePricingRuleSchema = PricingRuleSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export async function createPricingRule(formData: FormData) {
  console.log("--- createPricingRule Action ---");
  const rawData = {
    laundryCategoryId: formData.get("laundryCategoryId"),
    serviceTypeId: formData.get("serviceTypeId"),
    price: formData.get("price"),
    minPrice: formData.get("minPrice"),
    maxPrice: formData.get("maxPrice"),
    unitOfMeasurement: formData.get("unitOfMeasurement"),
    sizeBasedRates: formData.get("sizeBasedRates"),
  };
  console.log("Received raw form data:", rawData);

  const validatedFields = CreatePricingRuleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten());
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  console.log("Validation successful. Data to be saved:", validatedFields.data);

  try {
    console.log("Attempting to create pricing rule in DB...");
    await prisma.pricingRule.create({
      data: {
        laundryCategoryId: validatedFields.data.laundryCategoryId,
        serviceTypeId: validatedFields.data.serviceTypeId,
        price: validatedFields.data.price,
        minPrice: validatedFields.data.minPrice,
        maxPrice: validatedFields.data.maxPrice,
        unitOfMeasurement: validatedFields.data.unitOfMeasurement,
        sizeBasedRates: validatedFields.data.sizeBasedRates
          ? JSON.parse(validatedFields.data.sizeBasedRates)
          : undefined,
      },
    });
    revalidatePath("/admin/pricing-rules");
    console.log("DB operation successful.");
    return { success: true };
  } catch (error) {
    console.error("Error during DB operation:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updatePricingRule(formData: FormData) {
  console.log("--- updatePricingRule Action ---");
  const rawData = {
    id: formData.get("id"),
    laundryCategoryId: formData.get("laundryCategoryId"),
    serviceTypeId: formData.get("serviceTypeId"),
    price: formData.get("price"),
    minPrice: formData.get("minPrice"),
    maxPrice: formData.get("maxPrice"),
    unitOfMeasurement: formData.get("unitOfMeasurement"),
    sizeBasedRates: formData.get("sizeBasedRates"),
  };
  console.log("Received raw form data for update:", rawData);

  const validatedFields = UpdatePricingRuleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Update validation failed:", validatedFields.error.flatten());
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...data } = validatedFields.data;
  console.log("Update validation successful. Data to be updated:", data);

  try {
    console.log(`Attempting to update pricing rule ${id} in DB...`);
    await prisma.pricingRule.update({
      where: { id },
      data: {
        ...data,
        sizeBasedRates: data.sizeBasedRates
          ? JSON.parse(data.sizeBasedRates)
          : undefined,
      },
    });
    revalidatePath("/admin/pricing-rules");
    console.log("DB update successful.");
    return { success: true };
  } catch (error) {
    console.error(`Error during DB update for ${id}:`, error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deletePricingRule(id: string) {
  try {
    await prisma.pricingRule.delete({ where: { id } });
    revalidatePath("/admin/pricing-rules");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function getPricingRules() {
  return prisma.pricingRule.findMany({
    include: {
      laundryCategory: true,
      serviceType: true,
    },
  });
}
