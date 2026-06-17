"use server";

import { request } from "@/lib/api";

interface CreateProductInput {
	name: string;
	barcode: string;
	price: number;
}

export async function getProducts() {
	try {
		const response = await request("/Products", { protected: true });
		const data = await response.json();
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (error: any) {
		return { success: false, data: [], error: error.message };
	}
}

// 🌟 Το νέο σου Server Action για το Create Product
export async function createProduct(payload: CreateProductInput) {
	try {
		const response = await request("/Products", {
			method: "POST",
			protected: true, // Αν χρειάζεται να είναι προστατευμένο το endpoint
			body: payload,
		});

		if (!response.ok) {
			throw new Error("Failed to create product.");
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return { success: false, error: error.message || "An error occurred." };
	}
}
