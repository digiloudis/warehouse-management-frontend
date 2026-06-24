"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text } from "@radix-ui/themes";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { Searchbar } from "@/components/Searchbar";
import { ListCard } from "@/components/ListCard";
import { Pagination } from "@/components/Pagination";

// actions
import { getTransactions } from "./actions";
import { getProducts } from "../products/actions";
import { getWarehouses } from "../warehouses/actions";

// lib
import { formatNumber } from "@/lib/format";

// types
import type { Transaction } from "./actions";
import type { Product } from "../products/actions";
import type { Warehouse } from "../warehouses/actions";

// data
const sorts: Record<string, string> = {
	"date-descending": "Date (Newest)",
	"date-ascending": "Date (Oldest)",
	"quantity-descending": "Quantity (Highest)",
	"quantity-ascending": "Quantity (Lowest)",
	"product-name-ascending": "Product name (A-Z)",
	"product-name-descending": "Product name (Z-A)",
	"warehouse-name-ascending": "Warehouse name (A-Z)",
	"warehouse-name-descending": "Warehouse name (Z-A)",
	"type-inbound": "Type (Inbound)",
	"type-outbound": "Type (Outbound)",
};

export default function Page() {
	const router = useRouter();
	const toast = useToast();

	const [transactions, setTransactions] = useState<Array<Transaction>>([]);
	const [products, setProducts] = useState<Array<Product>>([]);
	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);

	const [page, setPage] = useState<number>(1);
	const [search, setSearch] = useState<string>("");
	const [sortMode, setSortMode] = useState<string>("date-descending");

	const [isLoading, setIsLoading] = useState<boolean>(true);

	// get transactions, products, & warehouses
	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		let isMounted: boolean = true;
		setIsLoading(true);

		Promise.all([getTransactions(), getProducts(), getWarehouses()])
			.then(([transactionsResponse, productsResponse, warehousesResponse]) => {
				if (!isMounted) return;

				if (transactionsResponse && transactionsResponse.success) {
					setTransactions(transactionsResponse.data ?? []);
				} else {
					toastRef.current.show("error", transactionsResponse?.message || "Failed to fetch transactions.");
					setTransactions([]);
				}

				if (productsResponse && productsResponse.success) {
					setProducts(productsResponse.data ?? []);
				} else {
					toastRef.current.show("error", productsResponse?.message || "Failed to fetch products.");
					setProducts([]);
				}

				if (warehousesResponse && warehousesResponse.success) {
					setWarehouses(warehousesResponse.data ?? []);
				} else {
					toastRef.current.show("error", warehousesResponse?.message || "Failed to fetch warehouses.");
					setWarehouses([]);
				}
			})
			.catch((error) => {
				if (!isMounted) return;

				console.error(error);
				toastRef.current.show("error", "Something went wrong while loading data.");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	// transaction search
	const searchedTransactions: Array<Transaction> = transactions.filter((transaction: Transaction) => {
		const product: Product | undefined = products.find((product: Product) => product.id === transaction.productId);
		const warehouse: Warehouse | undefined = warehouses.find((warehouse: Warehouse) => warehouse.id === transaction.warehouseId);

		const term: string = search.toLowerCase();

		const productName: string = product?.name?.toLowerCase() || "";
		const productBarcode: string = product?.barcode?.toLowerCase() || "";
		const warehouseName: string = warehouse?.name?.toLowerCase() || "";

		return productName.includes(term) || productBarcode.includes(term) || warehouseName.includes(term);
	});

	// transaction sort
	const sortedTransactions: Array<Transaction> = [...searchedTransactions].sort((transactionA: Transaction, transactionB: Transaction) => {
		const names = {
			products: {
				a: products.find((product: Product) => product.id === transactionA.productId)?.name || "",
				b: products.find((product: Product) => product.id === transactionB.productId)?.name || "",
			},
			warehouses: {
				a: warehouses.find((warehouse: Warehouse) => warehouse.id === transactionA.warehouseId)?.name || "",
				b: warehouses.find((warehouse: Warehouse) => warehouse.id === transactionB.warehouseId)?.name || "",
			},
		};

		switch (sortMode) {
			case "date-descending":
				return new Date(transactionB.date).getTime() - new Date(transactionA.date).getTime();
			case "date-ascending":
				return new Date(transactionA.date).getTime() - new Date(transactionB.date).getTime();
			case "quantity-descending":
				return transactionB.quantity - transactionA.quantity;
			case "quantity-ascending":
				return transactionA.quantity - transactionB.quantity;
			case "product-name-ascending":
				return names.products.a.localeCompare(names.products.b || "");
			case "product-name-descending":
				return names.products.b.localeCompare(names.products.a || "");
			case "warehouse-name-ascending":
				return names.warehouses.a.localeCompare(names.warehouses.b || "");
			case "warehouse-name-descending":
				return names.warehouses.b.localeCompare(names.warehouses.a || "");
			case "type-inbound":
				return transactionA.type.localeCompare(transactionB.type);
			case "type-outbound":
				return transactionB.type.localeCompare(transactionA.type);
			default:
				return 0;
		}
	});

	// transaction pagination
	const pages: number = Math.ceil(sortedTransactions.length / 10) || 1;
	const startIndex: number = (page - 1) * 10;
	const endIndex: number = startIndex + 10;

	const paginatedTransactions: Array<Transaction> = sortedTransactions.slice(startIndex, endIndex);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Transactions", url: "/dashboard/transactions" },
				]}
			/>

			{/* header */}
			<Header
				title="Transactions"
				description="Log new stock movements, view past inbound or outbound transfers, and track exactly how inventory travels through your network."
				buttons={[
					{
						button: (
							<Button color="green" className="!cursor-pointer" onClick={() => router.push("/dashboard/transactions/create?type=in")}>
								<PlusIcon width="16" height="16" />
								New inbound
							</Button>
						),
					},
					{
						button: (
							<Button color="red" className="!cursor-pointer" onClick={() => router.push("/dashboard/transactions/create?type=out")}>
								<MinusIcon width="16" height="16" />
								New outbound
							</Button>
						),
					},
				]}
			/>

			{/* search & sort */}
			{!isLoading && transactions.length > 0 && (
				<Searchbar
					search={search}
					searchPlaceholder="Search transaction.."
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					sortMode={sortMode}
					onSortChange={setSortMode}
					sortOptions={sorts}
					sortSeparators={["date-ascending", "quantity-ascending", "product-name-descending", "warehouse-name-descending"]}
				/>
			)}

			{/* transactions */}
			<Flex width="100%" direction="column" gap="2">
				{isLoading && (
					<Text size="2" color="gray" className="select-none">
						Loading transactions...
					</Text>
				)}

				{!isLoading && searchedTransactions.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No transactions found.
					</Text>
				)}

				{!isLoading && sortedTransactions.length > 0 && (
					<>
						<Text size="2" color="gray" weight="medium" className="select-none">
							{sortedTransactions.length} transaction{sortedTransactions.length > 1 ? "s" : ""}
						</Text>
						{paginatedTransactions.map((transaction: Transaction) => {
							const product: Product | undefined = products.find((product: Product) => product.id === transaction.productId);
							const warehouse: Warehouse | undefined = warehouses.find((warehouse: Warehouse) => warehouse.id === transaction.warehouseId);

							const isInbound: boolean = transaction.type === "in";
							const formattedQuantity = `${isInbound ? "+" : "-"}${formatNumber(transaction.quantity)}`;

							return (
								<ListCard
									key={transaction.id}
									icon={isInbound ? <ArrowUpIcon width="24" height="24" /> : <ArrowDownIcon width="24" height="24" />}
									iconColor={isInbound ? "green" : "red"}
									title={product?.name ?? "Unknown product"}
									titleLink={product ? `/dashboard/products/${product.id}` : undefined}
									description={warehouse?.name ?? "Unknown warehouse"}
									descriptionLink={warehouse ? `/dashboard/warehouses/${warehouse.id}` : undefined}
									badge={formattedQuantity}
									badgeColor={isInbound ? "green" : "red"}
									badgeTooltip={transaction.quantity > 999 ? transaction.quantity.toLocaleString() : undefined}
									date={transaction.date}
								/>
							);
						})}
					</>
				)}
			</Flex>

			{/* pagination */}
			{!isLoading && transactions.length > 0 && <Pagination page={page} pages={pages} onPageChange={setPage} />}
		</>
	);
}
