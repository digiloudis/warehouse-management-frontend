import { NextRequest, NextResponse } from "next/server";

// proxies
import { authenticate } from "./proxies/authentication";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();
	return authenticate(request);
}
