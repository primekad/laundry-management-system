"use server";

import { revalidatePath } from "next/cache";
import { db as prisma } from "@/lib/db";
import { z } from "zod";

const CreateServiceTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function createServiceType(formData: FormData) {
  const validatedFields = CreateServiceTypeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.serviceType.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
      },
    });
   revalidatePath("/admin/service-types");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function getServiceTypes() {
  return prisma.serviceType.findMany();
}

const UpdateServiceTypeSchema = CreateServiceTypeSchema.extend({
  id: z.string(),
});

export async function updateServiceType(formData: FormData) {
  const validatedFields = UpdateServiceTypeSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.serviceType.update({
      where: {
        id: validatedFields.data.id,
      },
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
      },
    });
    revalidatePath("/admin/service-types");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteServiceType(id: string) {
  try {
    await prisma.serviceType.delete({
      where: {
        id,
      },
    });
    revalidatePath("/admin/service-types");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}
