'use server';

import { ResetPasswordState } from "@/app/(auth)/auth-v-types";
import {
    createFailureResponse,
    createSuccessResponse,
    createValidationErrorResponse,
    validateFormData
} from "@/app/(auth)/reset-password/reset-password-action-helpers";
import { resetPassword as resetPasswordHelper } from "@/lib/better-auth-helpers/user-commands-helpers";

export async function resetPassword(
  prevState: ResetPasswordState | undefined,
  formData: FormData,
): Promise<ResetPasswordState> {

  const validatedFields = validateFormData(formData);
  console.log(formData);

  if (!validatedFields.success) {
    return createValidationErrorResponse(validatedFields, formData);
  }

  const { password, token } = validatedFields.data;
  try {
    await resetPasswordHelper(password, token);
    return createSuccessResponse();
  } catch (error: any) {
    console.log(error);
    const errorMessage = error.message || "An unexpected error occurred. The reset link may be invalid or expired.";
    return createFailureResponse(errorMessage);
  }
}
