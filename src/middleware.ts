import { NextRequest, NextResponse } from "next/server";

// middleware
import { authenticate } from "./middleware/authentication";
import { authorize } from "./middleware/authorization";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return NextResponse.next();

	const authenticationResponse = authenticate(request);
	if (authenticationResponse.status !== 200) return authenticationResponse;

	return authorize(request);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
