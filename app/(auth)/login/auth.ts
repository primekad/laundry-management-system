'use server';

import {redirect} from 'next/navigation';
import {auth} from "@/lib/auth";
import {APIError} from "better-auth/api";
import {LoginSchema} from "@/lib/definitions/login-schema";
// Assuming better-auth might export an AuthError, otherwise use generic error handling
// import { AuthError } from 'better-auth'; 

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
        rememberMe?: string[];
        form?: string[]; // For general form errors like "Invalid credentials"
    };
    message?: string | null;
    success?: boolean;
};

export async function login(
    prevState: LoginState | undefined,
    formData: FormData,
): Promise<LoginState> {
    const validatedFields = LoginSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Could not log in.',
            success: false,
        };
    }

    const {email, password, rememberMe} = validatedFields.data;
    try {
        await auth.api.signInEmail({
            body: {email, password}
        });
    } catch (error) {
        console.log(error);
        if (error instanceof APIError) {
            return {
                message: error.message,
                errors: {form: [error.message]},
                success: false,
            };
        }
    }
    redirect('/dashboard');
}

export async function logout(): Promise<{ message?: string; error?: boolean; success?: boolean }> {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';

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
