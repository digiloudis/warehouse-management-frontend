"use server";

import { cookies } from "next/headers";

// lib
import { request } from "@/lib/api";

export async function getRole(): Promise<number | null> {
	const cookieStorage = await cookies();
	const role = cookieStorage.get("role")?.value;

	return role ? parseInt(role, 10) : null;
}

export async function wakeup(): Promise<boolean> {
	try {
		const response = await request("/health/wake");
		return response.ok;
	} catch (error) {
		return false;
	}
}
