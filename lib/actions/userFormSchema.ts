import {z} from "zod";

export const UserFormSchema = z.object({
    id: z.string(),
    firstName: z.string().min(2, {message: 'First name must be at least 2 characters.'}),
    surname: z.string().min(2, {message: 'Surname must be at least 2 characters.'}),
    email: z.string().email(),
    role: z.enum(['admin', 'manager', 'staff']),
    defaultBranchId: z.string({required_error: 'Please select a default branch.'}),
    isActive: z.boolean().default(true),
    phoneNumber: z.string().optional(),
    secondaryBranchIds: z.string().optional(),
});