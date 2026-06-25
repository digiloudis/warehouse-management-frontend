"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";

// contexts
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text, TextField, Dialog, Code, Strong, Link } from "@radix-ui/themes";
import { Pencil1Icon, ArchiveIcon, Cross1Icon, HomeIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ListCard } from "@/components/ListCard";
import { Pagination } from "@/components/Pagination";

// lib
import { formatNumber } from "@/lib/format";

// actions
import { getRole } from "../../actions";
import { archiveProduct, getProduct } from "../actions";
import { getWarehouseInventory, getWarehouses } from "../../warehouses/actions";
import { getTransactions } from "../../transactions/actions";

// types
import type { UserRole } from "../../actions";
import type { Product } from "../actions";
import type { Inventory, Warehouse } from "../../warehouses/actions";
import type { Transaction } from "../../transactions/actions";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
	const args = use(params);
	const toast = useToast();
	const router = useRouter();

	const [role, setRole] = useState<UserRole | null>(null);
	const [product, setProduct] = useState<Product | null>(null);
	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);
	const [transactions, setTransactions] = useState<Array<Transaction>>([]);
	const [warehouseInventories, setWarehouseInventories] = useState<Array<{ warehouse: Warehouse; product: Product; quantity: number }>>([]);

	const [inventoryPage, setInventoryPage] = useState<number>(1);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

	const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState<boolean>(false);
	const [archiveConfirmation, setArchiveConfirmation] = useState<string>("");

	// get role, product, warehouses, transactions, & inventory
	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		setIsLoading(true);

		Promise.all([getRole(), getProduct(parseInt(args.id)), getTransactions(), getWarehouses()])
			.then(async ([roleResponse, productResponse, transactionsResponse, warehousesResponse]) => {
				setRole(roleResponse);

				const currentProduct = productResponse && productResponse.success ? productResponse.data : null;

				if (currentProduct) setProduct(currentProduct);
				else {
					toastRef.current.show("error", "Failed to fetch product.");
					setProduct(null);
					return void setWarehouseInventories([]);
				}

				if (transactionsResponse && transactionsResponse.success) {
					setTransactions(transactionsResponse.data ?? []);
				} else {
					toastRef.current.show("error", transactionsResponse?.message || "Failed to fetch transactions.");
					setTransactions([]);
				}

				if (warehousesResponse && warehousesResponse.success && warehousesResponse.data) {
					setWarehouses(warehousesResponse.data);

					const inventoryPromises = warehousesResponse.data.map(async (warehouse) => {
						const inventoryResponse = await getWarehouseInventory(warehouse.id);
						if (inventoryResponse.success && inventoryResponse.data) {
							const item = inventoryResponse.data.find((item: Inventory) => item.productId === parseInt(args.id));

							if (item && item.quantity > 0) {
								return {
									warehouse: warehouse,
									product: currentProduct,
									quantity: item.quantity,
								};
							}
						}

						return null;
					});

					const results = await Promise.all(inventoryPromises);
					setWarehouseInventories(results.filter((item): item is { warehouse: Warehouse; product: Product; quantity: number } => item !== null));
				} else {
					toastRef.current.show("error", "Failed to fetch warehouses.");
					setWarehouses([]);
					setWarehouseInventories([]);
				}
			})
			.catch((error) => {
				console.error(error);
				toastRef.current.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));
	}, [args.id]);

	const isAdmin: boolean = role === 1;
	const isManager: boolean = role === 2;

	// archive confirmation
	async function handleArchive() {
		if (!product || !product.id) throw new Error();
		if (archiveConfirmation.toLowerCase() !== "archive") return;

		try {
			setIsActionLoading(true);

			const response = await archiveProduct(product.id);
			if (response.success) {
				toast.show("success", "Product archived.");
				setIsArchiveDialogOpen(false);

				router.push("/dashboard/products");
			} else toast.show("error", response.message || "failed to archive product");
		} catch (error) {
			console.error(error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsActionLoading(false);
		}
	}

	// inventory pagination
	const inventoryPages: number = Math.ceil(warehouseInventories.length / 10) || 1;
	const inventoryStartIndex: number = (inventoryPage - 1) * 10;
	const inventoryEndIndex: number = inventoryStartIndex + 10;

	const paginatedInventories = warehouseInventories.slice(inventoryStartIndex, inventoryEndIndex);

	if (isLoading)
		return (
			<Text size="2" className="select-none text-[var(--gray-10)]">
				Loading product...
			</Text>
		);

	if (!product)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Products", url: "/dashboard/products" },
						{ label: "Unknown product", url: `/dashboard/products/` },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Product not found.
				</Text>
			</>
		);

	if (product?.isArchived)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Products", url: "/dashboard/products" },
						{ label: product.name, url: `/dashboard/products/${product.id}` },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Product is archived.
				</Text>
			</>
		);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Products", url: "/dashboard/products" },
					{ label: product.name, url: `/dashboard/products/${product.id}` },
				]}
			/>

			{/* header */}
			<Header
				title={product.name}
				titleCopy
				description={product.barcode}
				descriptionCopy
				buttons={[
					{
						button: (
							<Button
								variant="soft"
								color="gray"
								size="2"
								className="!cursor-pointer"
								onClick={() =>
									router.push(
										`/dashboard/products/${product.id}/edit?name=${encodeURIComponent(product.name)}&barcode=${encodeURIComponent(product.barcode)}&price=${product.price}`,
									)
								}
							>
								<Pencil1Icon width="16" height="16" />
								Edit
							</Button>
						),
					},
					{
						isShown: isAdmin || isManager,
						button: (
							<Dialog.Root
								open={isArchiveDialogOpen}
								onOpenChange={(open) => {
									setIsArchiveDialogOpen(open);
									if (!open) setArchiveConfirmation("");
								}}
							>
								<Dialog.Trigger>
									<Button color="red" size="2" className="!cursor-pointer" disabled={!product?.id}>
										<ArchiveIcon width="16" height="16" />
										Archive
									</Button>
								</Dialog.Trigger>

								<Dialog.Content size="2" maxWidth="400px">
									<Dialog.Title className="select-none">Archive product</Dialog.Title>
									<Dialog.Description size="2" mb="2" className="select-none">
										This action will archive <Strong>{product?.name}</Strong>. To confirm, please type{" "}
										<Code color="red" weight="bold">
											archive
										</Code>{" "}
										below.
									</Dialog.Description>

									<Flex direction="column" gap="2">
										<label>
											<TextField.Root
												placeholder='Type "archive" to confirm'
												value={archiveConfirmation}
												onChange={(event) => setArchiveConfirmation(event.target.value)}
												disabled={isActionLoading}
												autoComplete="off"
											/>
										</label>
										<Flex justify="end" gap="2">
											<Dialog.Close>
												<Button variant="soft" color="gray" className="!cursor-pointer" disabled={isActionLoading}>
													<Cross1Icon width="12" height="12" />
													Cancel
												</Button>
											</Dialog.Close>
											<Button
												color="red"
												className="!cursor-pointer"
												disabled={archiveConfirmation.toLowerCase() !== "archive" || isActionLoading}
												loading={isActionLoading}
												onClick={handleArchive}
											>
												<ArchiveIcon width="12" height="12" />
												Archive
											</Button>
										</Flex>
									</Flex>
								</Dialog.Content>
							</Dialog.Root>
						),
					},
				]}
			/>

			{/* recent transactions */}
			<Flex width="100%" direction="column" gap="2">
				<Flex width="100%" align="center" justify="between" className="!select-none">
					<Text weight="bold">Recent transactions</Text>
					{transactions.length > 5 && (
						<Link size="2" color="gray" className="cursor-pointer" href="#" onClick={() => router.push("/dashboard/transactions")}>
							View all
						</Link>
					)}
				</Flex>

				{transactions.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No transactions found.
					</Text>
				)}

				{transactions.length > 0 &&
					transactions
						.filter((transaction: Transaction) => transaction.productId === parseInt(args.id))
						.sort(
							(transactionA: Transaction, transactionB: Transaction) =>
								new Date(transactionB.date).getTime() - new Date(transactionA.date).getTime(),
						)
						.slice(0, 5)
						.map((transaction: Transaction) => {
							const isInbound: boolean = transaction.type === "in";

							const warehouse: Warehouse | undefined = warehouses.find((warehouse: Warehouse) => warehouse.id === transaction.warehouseId);

							return (
								<ListCard
									key={transaction.id}
									icon={isInbound ? <ArrowUpIcon width="24" height="24" /> : <ArrowDownIcon width="24" height="24" />}
									iconColor={isInbound ? "green" : "red"}
									title={product?.name ?? "Unknown product"}
									titleLink={product ? `/dashboard/products/${product.id}` : undefined}
									description={warehouse?.name ?? "Unknown warehouse"}
									descriptionLink={warehouse ? `/dashboard/warehouses/${warehouse.id}` : undefined}
									badge={`${isInbound ? "+" : "-"}${formatNumber(transaction.quantity)}`}
									badgeColor={isInbound ? "green" : "red"}
									badgeTooltip={transaction.quantity > 999 ? transaction.quantity.toLocaleString() : undefined}
									date={transaction.date}
								/>
							);
						})}
			</Flex>

			{/* inventory */}
			<Flex width="100%" direction="column" gap="2">
				<Text weight="bold" className="select-none">
					Inventory
				</Text>
				{warehouseInventories.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No inventories found.
					</Text>
				)}

				{warehouseInventories.length > 0 && (
					<Flex width="100%" direction="column" gap="2">
						{paginatedInventories.map((item) => {
							return (
								<ListCard
									key={item.warehouse.id}
									icon={<HomeIcon width="24" height="24" />}
									iconColor="amber"
									title={item.warehouse.name}
									titleLink={`/dashboard/warehouses/${item.warehouse.id}`}
									description={item.warehouse.location}
									badge={`${item.quantity} units`}
								/>
							);
						})}

						{/* pagination */}
						{!isLoading && warehouseInventories.length > 0 && (
							<Flex width="100%" align="center" justify="center">
								<Pagination page={inventoryPage} pages={inventoryPages} onPageChange={setInventoryPage} />
							</Flex>
						)}
					</Flex>
				)}
			</Flex>
		</>
	);
}
