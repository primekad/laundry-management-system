import { createAuthClient } from "better-auth/react";
import {adminClient, customSessionClient, inferAdditionalFields} from "better-auth/client/plugins";
import { auth } from "@/lib/auth"; // For admin functionalities on client

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient(), // Include admin client plugin if you plan to use its client-side features
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>()
  ],
});
