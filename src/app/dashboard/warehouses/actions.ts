"use server";

// lib
import { request } from "@/lib/api";

export async function getWarehouses() {
	try {
		// call the api
		const response = await request("/warehouses", { protected: true });
		const data = await response.json();

		const warehouses = Array.isArray(data) ? data : [];

		return { success: true, data: warehouses, count: warehouses.length };
	} catch (error: any) {
		return {
			success: false,
			data: [],
			count: 0,
			error: error.message || "something wrong",
		};
	}
}
