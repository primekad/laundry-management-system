'use server';

import { RequestPasswordResetState } from "@/app/(auth)/auth-v-types";
import {
    createFailureResponse,
    createSuccessResponse,
    createValidationErrorResponse,
    validateFormData
} from "@/app/(auth)/forgot-password/forgot-password-action-helpers";
import { requestPasswordReset as requestPasswordResetHelper } from "@/lib/better-auth-helpers/user-commands-helpers";

export async function requestPasswordReset(
  prevState: RequestPasswordResetState | undefined,
  formData: FormData,
): Promise<RequestPasswordResetState> {

  const validatedFields = validateFormData(formData);

  if (!validatedFields.success) {
    return createValidationErrorResponse(validatedFields, formData);
  }

  const { email } = validatedFields.data;
  try {
    await requestPasswordResetHelper(email, "fgp");
    return createSuccessResponse();
  } catch (error) {
    console.log(error);
    return createFailureResponse('An unexpected error occurred. Please try again later.');
  }
}
