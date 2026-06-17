"use server";

import { request } from "@/lib/api";

export async function getWarehouseInventory(id: string) {
	try {
		// 1. Fetch το inventory της αποθήκης
		const inventoryResponse = await request(`/inventory/${id}`, { protected: true });
		const inventoryData = await inventoryResponse.json();

		const inventory = Array.isArray(inventoryData) ? inventoryData : [];

		// 2. Παράλληλο fetch για τις πληροφορίες του κάθε προϊόντος
		const enrichedInventory = await Promise.all(
			inventory.map(async (item: any) => {
				try {
					const productResponse = await request(`/products/${item.productId}`, { protected: true });
					const productData = await productResponse.json();

					return {
						...item,
						productName: productData.name || `Product #${item.productId}`,
						productBarcode: productData.barcode || "No Barcode",
						productPrice: productData.price || 0,
						// Υπολογισμός αξίας για το συγκεκριμένο stock: quantity * price
						totalValue: item.quantity * (productData.price || 0),
					};
				} catch (productError) {
					return {
						...item,
						productName: `Product #${item.productId}`,
						productBarcode: "N/A",
						productPrice: 0,
						totalValue: 0,
					};
				}
			}),
		);

		return {
			success: true,
			data: enrichedInventory,
		};
	} catch (error: any) {
		return {
			success: false,
			data: [],
			error: error.message || "Could not fetch inventory",
		};
	}
}
