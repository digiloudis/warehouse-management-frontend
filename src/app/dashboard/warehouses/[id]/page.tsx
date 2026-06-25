"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";

// contexts
import { useToast } from "@/context/ToastContext";

// components
import { Flex, Text, Link } from "@radix-ui/themes";
import { HomeIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ListCard } from "@/components/ListCard";
import { Pagination } from "@/components/Pagination";

// lib
import { formatNumber } from "@/lib/format";

// actions
import { getWarehouseInventory, getWarehouse } from "../actions";
import { getProducts } from "../../products/actions";
import { getTransactions } from "../../transactions/actions";

// types
import type { Inventory, Warehouse } from "../actions";
import type { Product } from "../../products/actions";
import type { Transaction } from "../../transactions/actions";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
	const args = use(params);
	const toast = useToast();
	const router = useRouter();

	const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
	const [inventory, setInventory] = useState<Array<Inventory>>([]);
	const [products, setProducts] = useState<Array<Product>>([]);
	const [transactions, setTransactions] = useState<Array<Transaction>>([]);

	const [inventoryPage, setInventoryPage] = useState<number>(1);

	const [isLoading, setIsLoading] = useState<boolean>(true);

	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		const warehouseId = parseInt(args.id);
		if (isNaN(warehouseId)) return;

		setIsLoading(true);

		Promise.allSettled([getWarehouse(warehouseId), getWarehouseInventory(warehouseId), getProducts(), getTransactions()])
			.then(([warehouseResponse, inventoryResponse, productsResponse, transactionsResponse]) => {
				if (warehouseResponse.status === "fulfilled" && warehouseResponse.value?.success) {
					setWarehouse(warehouseResponse.value.data);
				} else {
					toastRef.current.show("error", "Failed to fetch warehouse.");
					setWarehouse(null);
				}

				if (inventoryResponse.status === "fulfilled" && inventoryResponse.value?.success) {
					setInventory(inventoryResponse.value.data ?? []);
				} else {
					toastRef.current.show("error", "Failed to fetch inventory.");
					setInventory([]);
				}

				if (productsResponse.status === "fulfilled" && productsResponse.value?.success) {
					setProducts(productsResponse.value.data ?? []);
				} else {
					toastRef.current.show("error", "Failed to fetch products.");
					setProducts([]);
				}

				if (transactionsResponse.status === "fulfilled" && transactionsResponse.value?.success) {
					setTransactions(transactionsResponse.value.data ?? []);
				} else {
					toastRef.current.show("error", "Failed to fetch transactions.");
					setTransactions([]);
				}
			})
			.catch((error) => {
				console.error(error);
				toastRef.current.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));
	}, [args.id]);

	const inventoryPages: number = Math.ceil(inventory.length / 10) || 1;
	const inventoryStartIndex: number = (inventoryPage - 1) * 10;
	const inventoryEndIndex: number = inventoryStartIndex + 10;

	const paginatedInventory = inventory.slice(inventoryStartIndex, inventoryEndIndex);

	if (isLoading)
		return (
			<Text size="2" className="select-none text-[var(--gray-10)]">
				Loading warehouse...
			</Text>
		);

	if (!warehouse)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Warehouse", url: "/dashboard/warehouses" },
						{ label: "Unknown warehouse", url: `/dashboard/warehouses/` },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Warehouse not found.
				</Text>
			</>
		);

	const filteredTransactions: Array<Transaction> = transactions.filter((transaction: Transaction) => transaction.warehouseId === warehouse.id);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Warehouse", url: "/dashboard/warehouses" },
					{ label: warehouse.name, url: `/dashboard/warehouses/${warehouse.id}` },
				]}
			/>

			{/* header */}
			<Header title={warehouse.name} titleCopy description={warehouse.location} descriptionCopy />

			{/* recent transactions */}
			<Flex width="100%" direction="column" gap="2">
				<Flex width="100%" align="center" justify="between" className="!select-none">
					<Text weight="bold">Recent transactions</Text>
					{filteredTransactions.length > 5 && (
						<Link size="2" color="gray" className="cursor-pointer" onClick={() => router.push("/dashboard/transactions")}>
							View all
						</Link>
					)}
				</Flex>

				{filteredTransactions.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No transactions found.
					</Text>
				)}

				{filteredTransactions.length > 0 &&
					filteredTransactions
						.sort(
							(transactionA: Transaction, transactionB: Transaction) =>
								new Date(transactionB.date).getTime() - new Date(transactionA.date).getTime(),
						)
						.slice(0, 5)
						.map((transaction: Transaction) => {
							const isInbound: boolean = transaction.type === "in";
							const product: Product | undefined = products.find((product: Product) => product.id === transaction.productId);

							return (
								<ListCard
									key={transaction.id}
									icon={isInbound ? <ArrowUpIcon width="24" height="24" /> : <ArrowDownIcon width="24" height="24" />}
									iconColor={isInbound ? "green" : "red"}
									title={product?.name ?? "Unknown product"}
									titleLink={product ? `/dashboard/products/${product.id}` : undefined}
									description={warehouse.name}
									descriptionLink={`/dashboard/warehouses/${warehouse.id}`}
									badge={`${isInbound ? "+" : "-"}${formatNumber(transaction.quantity)}`}
									badgeColor={isInbound ? "green" : "red"}
									badgeTooltip={transaction.quantity > 999 ? transaction.quantity.toLocaleString() : undefined}
									date={transaction.date}
								/>
							);
						})}
			</Flex>

			{/* inventory */}
			<Flex width="100%" direction="column" gap="2" mt="4">
				<Flex width="100%" align="center" justify="between" className="select-none">
					<Text weight="bold">Inventory</Text>
					{!isLoading && inventory.length > 10 && <Pagination page={inventoryPage} pages={inventoryPages} onPageChange={setInventoryPage} />}
				</Flex>

				{inventory.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No inventories found.
					</Text>
				)}

				{inventory.length > 0 && (
					<Flex width="100%" direction="column" gap="2">
						{paginatedInventory.map((item) => {
							const product = products.find((p) => p.id === item.productId);
							return (
								<ListCard
									key={item.productId}
									icon={<HomeIcon width="24" height="24" />}
									iconColor="amber"
									title={product?.name ?? "Unknown product"}
									titleLink={product ? `/dashboard/products/${product.id}` : undefined}
									description={product?.barcode ?? "No barcode"}
									badge={`${formatNumber(item.quantity)} units`}
									badgeTooltip={item.quantity.toLocaleString()}
								/>
							);
						})}
					</Flex>
				)}
			</Flex>
		</>
	);
}
