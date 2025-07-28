import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

/**
 * Get the current user session from the server
 * For server components only
 */
export async function getCurrentUser() {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
        ...Object.fromEntries(headersList.entries())
      },
    });
    
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
