export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
        rememberMe?: string[];
        form?: string[]; // For general form errors like "Invalid credentials"
    };
    message?: string | null;
    success?: boolean;
    email?: string;
    rememberMe?: boolean;
};

export interface ResetPasswordState {
    message: string | null
    errors: {
        password?: string[]
        passwordConfirmation?: string[]
        token?: string[]
    }
    success: boolean
}

export interface RequestPasswordResetState {
    message: string | null
    errors: {
        email?: string[]
    }
    success: boolean
}