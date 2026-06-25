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

type Inventory = {
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
		if (!Array.isArray(data)) return { success: false, message: "Failed to load warehouses." };

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
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function getWarehouse(id: number): Promise<ActionResponse<Warehouse>> {
	try {
		// call api
		const warehousesResponse = await getWarehouses();
		if (!warehousesResponse.success || !warehousesResponse.data) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = warehousesResponse.data.find((item) => item.id === id);
		if (!data || typeof data !== "object" || !("id" in data) || !("name" in data) || !("location" in data))
			return { success: false, message: "Failed to load warehouse details." };

		return {
			success: true,
			data: {
				id: data.id,
				name: data.name,
				location: data.location,
			},
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function createWarehouse(name: string, location: string): Promise<ActionResponse<Warehouse>> {
	try {
		// call api & check status
		const response = await request("/warehouses", { method: "POST", protected: true, body: { name, location } });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response body
		const data = await response.json();
		if (!data || typeof data !== "object") {
			return { success: false, message: "Warehouse data is corrupted." };
		}

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
		return { success: false, message: "An unexpected error occurred." };
	}
}

async function getWarehouseInventory(warehouseId: number): Promise<ActionResponse<Array<Inventory>>> {
	try {
		// call api
		const response = await request(`/inventory/${warehouseId}`, { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();
		if (!Array.isArray(data)) return { success: false, message: "Failed to load warehouse inventory." };

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
		return { success: false, message: "An unexpected error occurred." };
	}
}

export type { Warehouse, Inventory };
export { getWarehouses, getWarehouse, createWarehouse, getWarehouseInventory };
