"use server";

import { cookies } from "next/headers";

// lib
import { request } from "@/lib/api";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// types
type UserRole = 1 | 2 | 3;

// user
async function getRole(): Promise<UserRole> {
	const role: RequestCookie | undefined = (await cookies()).get("role");
	if (!role || !role.value) return 3;

	const parsed: number = parseInt(role.value, 10);
	if ([1, 2, 3].includes(parsed)) return parsed as UserRole;
	return 3;
}

async function getWarehouseCount() {
	try {
		// call the api
		const response = await request("/warehouses", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}

async function getProductCount() {
	try {
		// call the api
		const response = await request("/products", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}

async function getTransactionCount() {
	try {
		// call the api
		const response = await request("/transactions", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}

export type { UserRole };
export { getRole };
