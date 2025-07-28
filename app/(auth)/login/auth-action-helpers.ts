import {LoginState} from "@/app/(auth)/auth-v-types";
import {LoginSchema} from "@/app/(auth)/auth-schemas";

export function validateFormData(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    
    // Create a properly typed data object for validation
    const data: any = { ...rawData };
    
    // Convert string boolean values to actual booleans
    if (data.rememberMe === 'true') {
        data.rememberMe = true;
    } else if (data.rememberMe === 'false') {
        data.rememberMe = false;
    }
    
    return LoginSchema.safeParse(data);
}

export type LoginValidationResult = ReturnType<typeof LoginSchema.safeParse>;

export function createValidationErrorResponse(validationResult: LoginValidationResult, formData: FormData): LoginState {
    return {
        errors: validationResult.error?.flatten().fieldErrors,
        message: 'Invalid fields. Could not log in.',
        success: false,
        email: formData.get('email') as string,
    }
}

export function createFailureResponse(message: string): LoginState {
    return {
        message,
        success: false,
        errors: {form: [message]},
    };
}