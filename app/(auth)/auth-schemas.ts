import {z} from "zod";

export const LoginSchema = z.object({
    email: z.string().email({message: 'Please enter a valid email address.'}),
    password: z.string().min(1, {message: 'Password is required.'}),
    rememberMe: z.boolean().optional().default(false),
});