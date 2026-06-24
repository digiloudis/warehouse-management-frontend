import { NextResponse } from "next/server";

// types
import type { NextRequest } from "next/server";
import type { UserRole } from "@/app/dashboard/actions";

// config
const routes: Record<string, Array<UserRole>> = {
	"/dashboard/products/create": [1, 2],
};

export function authorize(request: NextRequest) {
	const pathname: string = request.nextUrl.pathname;
	const role: number = Number(request.cookies.get("role")?.value);

	if (pathname in routes) {
		const roles: Array<UserRole> = routes[pathname];
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
