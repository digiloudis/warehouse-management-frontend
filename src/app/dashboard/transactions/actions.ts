"use server";

// lib
import { request } from "@/lib/api";

// types
import type { ActionResponse } from "@/types/ActionResponse";

type Transaction = {
	id: number;
	productId: number;
	warehouseId: number;
	quantity: number;
	type: "in" | "out";
	date: Date;
};

async function getTransactions(): Promise<ActionResponse<Array<Transaction>>> {
	try {
		// call api
		const response = await request("/transactions", { protected: true });
		if (!response.ok) return { success: false, message: "Something went wrong. Please try again later." };

		// read response
		const data = await response.json();
		if (!Array.isArray(data)) return { success: false, message: "We couldn't load your transaction history right now" };

		return {
			success: true,
			data: data.map((item) => ({
				id: item.id,
				productId: item.productId,
				warehouseId: item.warehouseId,
				quantity: item.quantity,
				type: item.type.toLowerCase(),
				date: item.date,
			})),
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

async function createTransaction(transactions: Array<Transaction>): Promise<ActionResponse<void>> {
	try {
		const requests = transactions.map((tx) =>
			request(`/transactions/${tx.type}`, {
				method: "POST",
				protected: true,
				body: {
					warehouseId: tx.warehouseId,
					productId: tx.productId,
					quantity: tx.quantity,
				},
			}),
		);

		const responses = await Promise.all(requests);
		if (responses.some((response) => !response.ok)) return { success: false, message: "Some transactions failed to process. Please check your inventory." };

		return { success: true, data: null };
	} catch (error) {
		console.error(error);
		return { success: false, message: "An unexpected error has occurred." };
	}
}

export type { Transaction };
export { getTransactions, createTransaction };
