// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "./middleware/authentication";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return NextResponse.next();
	return authenticate(request);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
