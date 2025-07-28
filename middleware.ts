import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});
 
    console.log(sessionCookie, session);
    if (!sessionCookie || !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/admin", "/orders", "/users", "/branches", "/service-types", "/expense-categories", "/settings"], // Specify the routes the middleware applies to
};