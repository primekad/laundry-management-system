'use server';

import {redirect} from 'next/navigation';
import {APIError} from "better-auth/api";
import {LoginState} from "@/app/(auth)/auth-v-types";
import {
    createFailureResponse,
    createValidationErrorResponse,
    validateFormData
} from "@/app/(auth)/login/auth-action-helpers";
import {loginUser} from "@/lib/better-auth-helpers/user-commands-helpers";


export async function login(
    prevState: LoginState | undefined,
    formData: FormData,
): Promise<LoginState> {

    const validatedFields =   validateFormData(formData);
    console.log(formData);

    if (!validatedFields.success) {
       return createValidationErrorResponse(validatedFields, formData);
    }

    const {email, password, rememberMe} = validatedFields.data;
    try {
       const response = await loginUser(email, password, rememberMe);
       //ToDo: handle structured logging

    } catch (error) {
        console.log(error);
        if (error instanceof APIError) {
            return createFailureResponse(error.message);
        }
        return createFailureResponse('An unknown error occurred.');
    }
    redirect('/dashboard');
}

export async function logout(): Promise<{ message?: string; error?: boolean; success?: boolean }> {
    const baseUrl = process.env.BETTER_AUTH_URL

    try {
        const signOutResponse = await fetch(`${baseUrl}/api/auth/signout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // No body is typically needed for a POST to signout
        });

        if (!signOutResponse.ok) {
            console.error('Logout API request failed:', signOutResponse.status, signOutResponse.statusText);
            // Even if API fails, attempt to redirect to ensure user is on a "logged out" page.
            // Optionally, you could return an error state here if the UI needs to display something specific.
            // For now, we prioritize redirecting.
        }
    } catch (error: unknown) {
        console.error('Logout Action Error:', error);
        // An error occurred during the fetch itself (e.g., network issue).
        // Again, prioritize redirecting.
    }

    // Redirect to the login page. This happens after the try-catch block.
    // redirect() throws an error, so it will stop execution here.
    redirect('/login');

    // This part would only be reached if redirect was not called, e.g. if returning state instead.
    // return { success: true, message: 'Logged out successfully.' };
}
