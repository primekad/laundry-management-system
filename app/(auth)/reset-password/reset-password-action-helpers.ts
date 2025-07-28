import { z } from "zod";
import { ResetPasswordState } from "@/app/(auth)/auth-v-types";

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
  });

export function validateFormData(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  return ResetPasswordSchema.safeParse(rawData);
}

export type ResetPasswordValidationResult = ReturnType<typeof ResetPasswordSchema.safeParse>;

export function createValidationErrorResponse(
  validationResult: ResetPasswordValidationResult,
  formData: FormData
): ResetPasswordState {
  return {
    errors: validationResult.error?.flatten().fieldErrors || {},
    message: "Validation failed. Please check your input.",
    success: false,
  };
}

export function createFailureResponse(message: string): ResetPasswordState {
  return {
    message,
    success: false,
    errors: {},
  };
}

export function createSuccessResponse(): ResetPasswordState {
  return {
    message: "Your password has been reset successfully. You can now sign in.",
    errors: {},
    success: true,
  };
}
