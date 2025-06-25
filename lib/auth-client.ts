import { createAuthClient } from "better-auth/react";
import {adminClient, customSessionClient, inferAdditionalFields} from "better-auth/client/plugins";
import { auth } from "@/lib/auth"; // For admin functionalities on client

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    adminClient(), // Include admin client plugin if you plan to use its client-side features
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>()
  ],
});
