"use server";

import { request } from "@/lib/api";

interface ProductPayload {
	productId: number;
	name: string;
	barcode: string;
	price: number;
}

// 1. GET ALL
export async function getProducts() {
	try {
		const response = await request("/Products", { protected: true });
		const data = await response.json();
		return { success: true, data: Array.isArray(data) ? data : [] };
	} catch (error: any) {
		return { success: false, data: [], error: error.message };
	}
}

// 2. GET SINGLE (Χρειάζεται για να γεμίσει η Edit φόρμα)
export async function getProductById(id: string | number) {
	try {
		const response = await request(`/Products/${id}`, { protected: true });
		if (!response.ok) throw new Error("Product not found");
		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// 3. POST (Create)
export async function createProduct(payload: ProductPayload) {
	try {
		const response = await request("/Products", {
			method: "POST",
			protected: true,
			body: payload,
		});
		if (!response.ok) throw new Error("Failed to create product.");
		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// 5. DELETE
export async function deleteProduct(id: string | number) {
	try {
		const response = await request(`/Products/${id}`, {
			method: "DELETE",
			protected: true,
		});
		if (!response.ok) throw new Error("Failed to delete product.");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
