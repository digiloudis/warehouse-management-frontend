import { NextResponse } from "next/server";

// types
import type { NextRequest } from "next/server";

export function authenticate(request: NextRequest) {
	const pathname: string = request.nextUrl.pathname;
	const token: string | undefined = request.cookies.get("jwt")?.value;

	const isAuthPage: boolean = pathname.startsWith("/auth");

	// if logged in & at auth page
	if (isAuthPage && token) return NextResponse.redirect(new URL("/dashboard", request.url));

	// if not logged in && not at auth page
	if (!token && !isAuthPage) return NextResponse.redirect(new URL("/auth/login", request.url));

	return NextResponse.next();
}
