"use server";

// lib
import { request } from "@/lib/api";

// types
import type { ActionResponse } from "@/types/ActionResponse";

type Warehouse = {
	id: number;
	name: string;
	location: string;
};

type InventoryItem = {
	inventoryId: number;
	productId: number;
	productName: string;
	warehouseId: number;
	warehouseName: string;
	quantity: number;
};

async function getWarehouses(): Promise<ActionResponse<Array<Warehouse>>> {
	try {
		// call api
		const response = await request("/warehouses", { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();
		if (!Array.isArray(data)) return { success: false, message: "We couldn't load your warehouses right now" };

		return {
			success: true,
			data: data.map((item) => ({
				id: item.warehouseId,
				name: item.name,
				location: item.location,
			})),
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function getWarehouse(id: number): Promise<ActionResponse<Warehouse>> {
	try {
		// call api
		const response = await request(`/warehouses/${id}`, { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();

		// 💡 Διόρθωση: Έλεγχος για "warehouseId" αντί για "productId"
		if (!data || typeof data !== "object" || !("warehouseId" in data) || !("name" in data) || !("location" in data))
			return { success: false, message: "We couldn't load your warehouse right now" };

		return {
			success: true,
			data: {
				id: data.warehouseId,
				name: data.name,
				location: data.location,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function createWarehouse(body: { name: string; location: string }): Promise<ActionResponse<Warehouse>> {
	try {
		// call api & check status
		const response = await request("/warehouses", {
			method: "POST",
			protected: true,
			body: { name: body.name, location: body.location },
		});

		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response body
		const data = await response.json();
		if (!data || typeof data !== "object") {
			return { success: false, message: "Warehouse data is corrupt" };
		}

		return {
			success: true,
			data: {
				id: data.warehouseId, // Ή data.id, ανάλογα με το mapping του backend σου
				name: data.name,
				location: data.location,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function getWarehouseInventory(warehouseId: number): Promise<ActionResponse<Array<InventoryItem>>> {
	try {
		// call api
		const response = await request(`/inventory/${warehouseId}`, { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong while loading the inventory." };

		// read response
		const data = await response.json();
		if (!Array.isArray(data)) return { success: false, message: "We couldn't load the warehouse inventory right now." };

		return {
			success: true,
			data: data.map((item) => ({
				inventoryId: item.inventoryId,
				productId: item.productId,
				productName: item.productName,
				warehouseId: item.warehouseId,
				warehouseName: item.warehouseName,
				quantity: item.quantity,
			})),
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

export type { Warehouse, InventoryItem };
export { getWarehouses, getWarehouse, createWarehouse, getWarehouseInventory };
