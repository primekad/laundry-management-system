"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"

export interface RequestPasswordResetState {
  message: string | null
  errors: {
    email?: string[]
  }
  success: boolean
}

const RequestPasswordResetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
})

export async function requestPasswordReset(
  prevState: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const validatedFields = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
      success: false,
    }
  }

  try {
    await auth.api.forgetPassword({
      body:{
        email:validatedFields.data.email,
        redirectTo: "/reset-password"
      }
    })
    return {
      message: "If an account with that email exists, a password reset link has been sent.",
      errors: {},
      success: true,
    }
  } catch (error) {
    // Log the error for debugging, but don't expose details to the client
    console.error("Password reset request failed:", error)
    return {
      message: "An unexpected error occurred. Please try again later.",
      errors: {},
      success: false,
    }
  }
}
