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
		if (!Array.isArray(data)) return { success: false, message: "We couldn't load your products right now" };

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
		return { success: false, message: "An unexpected error has occurred." };
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
			return { success: false, message: "We couldn't load your product right now" };

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
		return { success: false, message: "An unexpected error has occurred." };
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
			return { success: false, message: "Product data is corrupt" };
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
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function updateProduct(id: number, body: { name: string; barcode: string; price: number }): Promise<ActionResponse<Product>> {
	try {
		// call api & check status
		const response = await request(`/products/${id}`, { method: "PUT", protected: true, body });
		if (!response.ok) return { success: false, message: "Something went wrong while updating the product." };

		// read response body
		const data = await response.json();
		if (!data || typeof data !== "object") {
			return { success: false, message: "Product data is corrupt" };
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
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function archiveProduct(id: number): Promise<ActionResponse<void>> {
	try {
		// call api & check status
		const response = await request(`/products/${id}`, { method: "DELETE", protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong while archiving the product." };

		return { success: true, data: null };
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

export type { Product };
export { getProducts, getProduct, createProduct, updateProduct, archiveProduct };
