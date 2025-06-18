import { DEFAULT_ADMIN } from "@/constants";
import {auth} from "@/lib/auth";
import {APIError} from "better-auth/api";

export async function doesUserExist(email: string): Promise<boolean> {
    // Note: The 'email' parameter is present due to existing usage (e.g., in scripts/create-admin.ts),
    // but this implementation of doesUserExist checks if *any* user account exists in the system,
    // not specifically if a user with the provided 'email' exists.
    // This is because auth.api.listUserAccounts() returns account provider details, not user emails.
    try {
        const users = await auth.api.listUsers({
                query: {
                    searchField: "email",
                    searchOperator: "contains",
                    searchValue: DEFAULT_ADMIN.email,
                },
        });
        // Returns true if there's at least one account, false otherwise.
        return users && users.total > 0;
    } catch (e) {
        console.error(`Error in doesUserExist (checking for any account, email param: ${email}):`, e);
        if (e instanceof APIError) {
            console.log(`API Error in doesUserExist: ${e.message}`);
        }
        // If an error occurs (e.g., API unavailable), rethrow to indicate the check failed.
        throw e;
    }
}