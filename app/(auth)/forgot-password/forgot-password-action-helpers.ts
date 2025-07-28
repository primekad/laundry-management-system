import { z } from "zod";
import { RequestPasswordResetState } from "@/app/(auth)/auth-v-types";

const RequestPasswordResetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export function validateFormData(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  return RequestPasswordResetSchema.safeParse(rawData);
}

export type ForgotPasswordValidationResult = ReturnType<typeof RequestPasswordResetSchema.safeParse>;

export function createValidationErrorResponse(
  validationResult: ForgotPasswordValidationResult,
  formData: FormData
): RequestPasswordResetState {
  return {
    errors: validationResult.error?.flatten().fieldErrors || {},
    message: "Validation failed. Please check your input.",
    success: false,
  };
}

export function createFailureResponse(message: string): RequestPasswordResetState {
  return {
    message,
    success: false,
    errors: {},
  };
}

export function createSuccessResponse(): RequestPasswordResetState {
  return {
    message: "If an account with that email exists, a password reset link has been sent.",
    errors: {},
    success: true,
  };
}
