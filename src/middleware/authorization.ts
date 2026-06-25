import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { UserRole } from "@/app/dashboard/actions";

const routes: Record<string, Array<UserRole>> = {
	"/dashboard/warehouses/create": [1],
	"/dashboard/products/create": [1, 2],
	"/dashboard/products/[id]/edit": [1, 2],
};

export function authorize(request: NextRequest) {
	const pathname: string = request.nextUrl.pathname;
	const role: number = Number(request.cookies.get("role")?.value);

	let matchedRoute: string | null = null;

	for (const route in routes) {
		const routeRegex = new RegExp("^" + route.replace(/\[.*?\]/g, "[^/]+") + "$");
		if (routeRegex.test(pathname)) {
			matchedRoute = route;
			break;
		}
	}

	if (matchedRoute) {
		const roles: Array<UserRole> = routes[matchedRoute];
		if (isNaN(role) || !roles.includes(role as UserRole)) {
			const referenceUrl = request.headers.get("referer");
			if (referenceUrl) return NextResponse.redirect(referenceUrl);

			const fallbackUrl = request.nextUrl.clone();
			fallbackUrl.pathname = "/dashboard";
			return NextResponse.redirect(fallbackUrl);
		}
	}

	return NextResponse.next();
}
