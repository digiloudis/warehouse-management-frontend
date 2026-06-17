"use server";

import { request } from "@/lib/api";

interface TransactionPayload {
	productId: number;
	quantity: number;
}

// 1. GET ALL TRANSACTIONS
export async function getTransactions() {
	try {
		const response = await request("/Transactions", { protected: true });
		const data = await response.json();
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (error: any) {
		return { success: false, data: [], error: error.message };
	}
}

// 2. GET PRODUCTS FOR THE DROPDOWN
export async function getProductsForSelect() {
	try {
		const response = await request("/Products", { protected: true });
		const data = await response.json();
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (error: any) {
		return { success: false, data: [] };
	}
}

// 3. POST /Transactions/in ή /Transactions/out
export async function createTransaction(type: "in" | "out", payload: TransactionPayload) {
	try {
		// Προσκρούει στο /api/Transactions/in ή /api/Transactions/out ανάλογα με το type
		const response = await request(`/Transactions/${type}`, {
			method: "POST",
			protected: true,
			body: payload,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || `Failed to record stock ${type}.`);
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
