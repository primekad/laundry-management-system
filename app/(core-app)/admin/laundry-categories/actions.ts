"use server"

import { revalidatePath } from "next/cache"
import { db as prisma } from "@/lib/db";
import { z } from "zod"
import { PricingType } from "@prisma/client"

const CreateLaundryCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  pricingType: z.nativeEnum(PricingType),
})

const UpdateLaundryCategorySchema = CreateLaundryCategorySchema.extend({
  id: z.string().min(1),
})

const DeleteLaundryCategorySchema = z.object({
  id: z.string().min(1),
})

export async function createLaundryCategory(formData: FormData) {
  const validatedFields = CreateLaundryCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    pricingType: formData.get("pricingType"),
  })

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors)
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await prisma.laundryCategory.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        pricingType: validatedFields.data.pricingType,
      },
    })
    revalidatePath("/admin/laundry-categories")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred." }
  }
}

export async function updateLaundryCategory(formData: FormData) {
  const validatedFields = UpdateLaundryCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    pricingType: formData.get("pricingType"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, ...data } = validatedFields.data

  try {
    await prisma.laundryCategory.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/laundry-categories")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred." }
  }
}

export async function deleteLaundryCategory(formData: FormData) {
  const validatedFields = DeleteLaundryCategorySchema.safeParse({
    id: formData.get("id"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await prisma.laundryCategory.delete({
      where: { id: validatedFields.data.id },
    })
    revalidatePath("/admin/laundry-categories")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred." }
  }
}

export async function getLaundryCategories() {
  return prisma.laundryCategory.findMany()
}

export async function getLaundryCategory(id: string) {
  return prisma.laundryCategory.findUnique({ where: { id } })
}
