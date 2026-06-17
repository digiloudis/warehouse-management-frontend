"use server";

// lib
import { request } from "@/lib/api";

export async function getWarehouseCount() {
	try {
		// call the api
		const response = await request("/warehouses", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		// Επιστρέφουμε πάντα count: 0 στο error για ασφάλεια
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}

export async function getProductCount() {
	try {
		// call the api
		const response = await request("/products", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		// Επιστρέφουμε πάντα count: 0 στο error για ασφάλεια
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}

export async function getTransactionCount() {
	try {
		// call the api
		const response = await request("/transactions", { protected: true });
		const data = await response.json();

		const count = Array.isArray(data) ? data.length : 0;
		return { success: true, count };
	} catch (error: any) {
		// Επιστρέφουμε πάντα count: 0 στο error για ασφάλεια
		return {
			error: error.message || "something wrong",
			count: 0,
			success: false,
		};
	}
}
