import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"; // For admin functionalities on client

// The baseURL can often be omitted if the client and server are on the same domain.
// Better Auth client will use relative paths for API calls (e.g., /api/auth/session).
// If you encounter issues or if your setup is more complex (e.g., different subdomains for API),
// you might need to explicitly set it: 
// baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000/api/auth"
// Note: For client-side access to env vars, they must be prefixed with NEXT_PUBLIC_.

export const authClient = createAuthClient({
  plugins: [
    adminClient(), // Include admin client plugin if you plan to use its client-side features
  ],
});

// You can also export specific methods if you prefer:
// export const { signIn, signUp, signOut, useSession, useUser, useIsAuthenticated } = authClient;
