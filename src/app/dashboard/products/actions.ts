"use server";

// lib
import { request } from "@/lib/api";

// types
import type { ActionResponse } from "@/types/ActionResponse";

type Product = {
	id: number;
	name: string;
	barcode: string;
	price: number;
	isArchived: boolean;
};

async function getProducts(isArchived?: boolean): Promise<ActionResponse<Array<Product>>> {
	try {
		// call api
		const response = await request("/products", { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();
		if (!Array.isArray(data)) return { success: false, message: "Failed to load products." };

		return {
			success: true,
			data: data
				.filter((item) => (isArchived === undefined ? true : item.isArchived === isArchived))
				.map((item) => ({
					id: item.productId,
					name: item.name,
					barcode: item.barcode,
					price: item.price,
					isArchived: item.isArchived,
				})),
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function getProduct(id: number): Promise<ActionResponse<Product>> {
	try {
		// call api
		const response = await request(`/products/${id}`, { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();
		if (
			!data ||
			typeof data !== "object" ||
			!("productId" in data) ||
			!("name" in data) ||
			!("barcode" in data) ||
			!("price" in data) ||
			!("isArchived" in data)
		)
			return { success: false, message: "Failed to load product details." };

		return {
			success: true,
			data: {
				id: data.productId,
				name: data.name,
				barcode: data.barcode,
				price: data.price,
				isArchived: data.isArchived,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function createProduct(name: string, barcode: string, price: number): Promise<ActionResponse<Product>> {
	try {
		// call api & check status
		const response = await request("/products", { method: "POST", protected: true, body: { name, barcode, price } });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response body
		const data = await response.json();
		if (!data || typeof data !== "object") {
			return { success: false, message: "Product data is corrupted." };
		}

		return {
			success: true,
			data: {
				id: data.productId,
				barcode: data.barcode,
				name: data.name,
				price: data.price,
				isArchived: data.isArchived,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function updateProduct(id: number, name: string, barcode: string, price: number): Promise<ActionResponse<Product>> {
	try {
		// call api & check status
		const response = await request(`/products/${id}`, { method: "PUT", protected: true, body: { productId: id, name, barcode, price } });

		if (!response.ok) {
			try {
				const errorData = await response.json();
				return { success: false, message: errorData.message || `Server returned status ${response.status}` };
			} catch {
				return { success: false, message: `Request failed with status ${response.status}.` };
			}
		}

		// read response body
		let data;
		try {
			data = await response.json();
		} catch {
			data = {};
		}

		return {
			success: true,
			data: {
				id: data && typeof data === "object" && "productId" in data ? data.productId : id,
				name: data && typeof data === "object" && "name" in data ? data.name : name,
				barcode: data && typeof data === "object" && "barcode" in data ? data.barcode : barcode,
				price: data && typeof data === "object" && "price" in data ? data.price : price,
				isArchived: data && typeof data === "object" && "isArchived" in data ? data.isArchived : false,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function archiveProduct(id: number): Promise<ActionResponse<void>> {
	try {
		// call api & check status
		const response = await request(`/products/${id}`, { method: "DELETE", protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		return { success: true, data: undefined };
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

export type { Product };
export { getProducts, getProduct, createProduct, updateProduct, archiveProduct };
