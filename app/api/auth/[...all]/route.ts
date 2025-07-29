import { auth } from "../../../../lib/auth"; // Assuming @/ is configured for src/ or project root
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
