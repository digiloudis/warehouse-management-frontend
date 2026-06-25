"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Flex, Text, Grid, Link } from "@radix-ui/themes";
import { HomeIcon, CubeIcon, RowSpacingIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

import { ListCard } from "@/components/ListCard";

// lib
import { formatNumber } from "@/lib/format";

// actions
import { getWarehouses } from "@/app/dashboard/warehouses/actions";
import { getProducts } from "@/app/dashboard/products/actions";
import { getTransactions } from "@/app/dashboard/transactions/actions";

// type
import type { Warehouse } from "@/app/dashboard/warehouses/actions";
import type { Product } from "@/app/dashboard/products/actions";
import type { Transaction } from "@/app/dashboard/transactions/actions";

export default function Page() {
	const router = useRouter();
	const toast = useToast();

	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);
	const [products, setProducts] = useState<Array<Product>>([]);
	const [transactions, setTransactions] = useState<Array<Transaction>>([]);

	const [isLoading, setIsLoading] = useState<boolean>(true);

	// get warehouses, products, & transactions
	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		let isMounted: boolean = true;
		setIsLoading(true);

		Promise.all([getWarehouses(), getProducts(), getTransactions()])
			.then(([warehousesResponse, productsResponse, transactionsResponse]) => {
				if (!isMounted) return;

				if (warehousesResponse && warehousesResponse.success) {
					setWarehouses(warehousesResponse.data ?? []);
				} else {
					toastRef.current.show("error", warehousesResponse?.message || "Failed to fetch warehouses.");
					setWarehouses([]);
				}

				if (productsResponse && productsResponse.success) {
					setProducts(productsResponse.data ?? []);
				} else {
					toastRef.current.show("error", productsResponse?.message || "Failed to fetch products.");
					setProducts([]);
				}

				if (transactionsResponse && transactionsResponse.success) {
					setTransactions(transactionsResponse.data ?? []);
				} else {
					toastRef.current.show("error", transactionsResponse?.message || "Failed to fetch transactions.");
					setTransactions([]);
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

	return (
		<>
			{/* cards */}
			<Grid width="100%" columns={{ initial: "1", md: "3" }} gap="4">
				<ListCard
					link="/dashboard/warehouses"
					icon={<HomeIcon width="24" height="24" />}
					title="Warehouses"
					description={isLoading ? ".." : formatNumber(warehouses.length)}
				/>
				<ListCard
					link="/dashboard/products"
					icon={<CubeIcon width="24" height="24" />}
					title="Products"
					description={isLoading ? ".." : formatNumber(products.length)}
				/>
				<ListCard
					link="/dashboard/transactions"
					icon={<RowSpacingIcon width="24" height="24" />}
					title="Transactions"
					description={isLoading ? ".." : formatNumber(transactions.length)}
				/>
			</Grid>

			{/* recent transactions */}
			{!isLoading && (
				<Grid width="100%" columns={{ initial: "1", md: "2" }} gap="6">
					<Flex width="100%" direction="column" gap="2">
						<Flex width="100%" align="center" justify="between" className="!select-none">
							<Text weight="bold">Recent inbound transactions</Text>
							{transactions.filter((transaction: Transaction) => transaction.type === "in").length > 5 && (
								<Link size="2" color="gray" className="cursor-pointer" href="#" onClick={() => router.push("/dashboard/transactions")}>
									View all
								</Link>
							)}
						</Flex>

						{transactions.filter((transaction: Transaction) => transaction.type === "in").length === 0 ? (
							<Text size="2" color="gray" className="select-none">
								No inbound transactions found.
							</Text>
						) : (
							transactions
								.filter((transaction: Transaction) => transaction.type === "in")
								.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
								.slice(0, 5)
								.map((transaction: Transaction) => {
									const product = products.find((p) => p.id === transaction.productId);
									const warehouse = warehouses.find((w) => w.id === transaction.warehouseId);

									return (
										<ListCard
											key={transaction.id}
											icon={<ArrowUpIcon width="24" height="24" />}
											iconColor="green"
											title={product?.name ?? "Unknown product"}
											titleLink={product ? `/dashboard/products/${product.id}` : undefined}
											description={warehouse?.name ?? "Unknown warehouse"}
											descriptionLink={warehouse ? `/dashboard/warehouses/${warehouse.id}` : undefined}
											badge={`+${formatNumber(transaction.quantity)}`}
											badgeColor="green"
											badgeTooltip={transaction.quantity > 999 ? transaction.quantity.toLocaleString() : undefined}
											date={transaction.date}
										/>
									);
								})
						)}
					</Flex>

					{/* right: outbound transactions */}
					<Flex width="100%" direction="column" gap="2">
						<Flex width="100%" align="center" justify="between" className="!select-none">
							<Text weight="bold">Recent outbound transactions</Text>
							{transactions.filter((transaction: Transaction) => transaction.type !== "in").length > 5 && (
								<Link size="2" color="gray" className="cursor-pointer" href="#" onClick={() => router.push("/dashboard/transactions")}>
									View all
								</Link>
							)}
						</Flex>

						{transactions.filter((transaction: Transaction) => transaction.type !== "in").length === 0 ? (
							<Text size="2" color="gray" className="select-none">
								No outbound transactions found.
							</Text>
						) : (
							transactions
								.filter((transaction: Transaction) => transaction.type !== "in")
								.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
								.slice(0, 5)
								.map((transaction: Transaction) => {
									const product = products.find((p) => p.id === transaction.productId);
									const warehouse = warehouses.find((w) => w.id === transaction.warehouseId);

									return (
										<ListCard
											key={transaction.id}
											icon={<ArrowDownIcon width="24" height="24" />}
											iconColor="red"
											title={product?.name ?? "Unknown product"}
											titleLink={product ? `/dashboard/products/${product.id}` : undefined}
											description={warehouse?.name ?? "Unknown warehouse"}
											descriptionLink={warehouse ? `/dashboard/warehouses/${warehouse.id}` : undefined}
											badge={`-${formatNumber(transaction.quantity)}`}
											badgeColor="red"
											badgeTooltip={transaction.quantity > 999 ? transaction.quantity.toLocaleString() : undefined}
											date={transaction.date}
										/>
									);
								})
						)}
					</Flex>
				</Grid>
			)}
		</>
	);
}
