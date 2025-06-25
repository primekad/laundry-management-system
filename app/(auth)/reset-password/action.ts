"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"

export interface ResetPasswordState {
  message: string | null
  errors: {
    password?: string[]
    passwordConfirmation?: string[]
    token?: string[]
  }
  success: boolean
}

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    passwordConfirmation: z.string(),
    token: z.string().min(1, { message: "Reset token is required." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"], // path of error
  })

export async function resetPassword(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    token: formData.get("token"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
      success: false,
    }
  }

  const { password, token } = validatedFields.data

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token
      }
    })
    return {
      message: "Your password has been reset successfully. You can now sign in.",
      errors: {},
      success: true,
    }
  } catch (error: any) {
    console.error("Password reset failed:", error)
    // Check for specific error types from better-auth if available
    // For now, a generic message is used.
    return {
      message:
        error.message || "An unexpected error occurred. The reset link may be invalid or expired.",
      errors: {},
      success: false,
    }
  }
}
