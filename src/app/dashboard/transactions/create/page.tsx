"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Badge, Button, Card, Flex, IconButton, Link, RadioGroup, Strong, Text, TextField } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

import Breadcrumbs from "@/components/Breadcrumbs";

// actions
import { createTransaction } from "../actions";
import { getProducts } from "../../products/actions";
import { getWarehouses } from "../../warehouses/actions";

// types
import type { Transaction } from "../actions";
import type { Product } from "../../products/actions";
import type { Warehouse } from "../../warehouses/actions";

export default function Page() {
	const router = useRouter();
	const toast = useToast();
	const params = useSearchParams();

	const [products, setProducts] = useState<Array<Product>>([]);
	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);
	const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	// Track state by Product ID mapping
	const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
	const [productSearch, setProductSearch] = useState<string>("");
	const [productPage, setProductPage] = useState<number>(1);

	// get transaction type
	const type: string = params.get("type") || "in";

	// get transactions, products, & warehouses
	useEffect(() => {
		setIsLoading(true);

		Promise.all([getProducts(), getWarehouses()])
			.then(([productsResponse, warehousesResponse]) => {
				if (!productsResponse.success) {
					toast.show("error", productsResponse.message);
					setProducts([]);
				} else setProducts(productsResponse.data ?? []);

				if (!warehousesResponse.success) {
					toast.show("error", warehousesResponse.message);
					setWarehouses([]);
				} else setWarehouses(warehousesResponse.data ?? []);
			})
			.catch((error) => {
				console.error(error);
				toast.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));
	}, []);

	const handleQtyChange = (productId: string, val: number) => {
		if (val <= 0) {
			const copy = { ...selectedQuantities };
			delete copy[productId];
			setSelectedQuantities(copy);
		} else {
			if (!selectedQuantities[productId] && Object.keys(selectedQuantities).length >= 10) {
				toast.show("error", "You can select a maximum of 10 products per transaction.");
				return;
			}
			setSelectedQuantities((prev) => ({ ...prev, [productId]: val }));
		}
	};

	// 1. Search filter
	const filteredPool = products.filter((p) => {
		const query = productSearch.toLowerCase();
		return p.name?.toLowerCase().includes(query) || (p.barcode?.toLowerCase() || "").includes(query);
	});

	// 2. Pinning: Active products float to page 1
	const sortedPipeline = [...filteredPool].sort((a, b) => {
		const aQty = selectedQuantities[a.id] ? 1 : 0;
		const bQty = selectedQuantities[b.id] ? 1 : 0;
		return bQty - aQty;
	});

	// 3. Pagination Engine
	const itemsPerPage = 5;
	const productPagesCount = Math.ceil(sortedPipeline.length / itemsPerPage) || 1;
	const startIndex = (productPage - 1) * itemsPerPage;
	const paginatedProducts = sortedPipeline.slice(startIndex, startIndex + itemsPerPage);

	// Explicitly declared pagination handlers to prevent runtime function reference issues
	const handlePrevPage = () => setProductPage((p) => Math.max(1, p - 1));
	const handleNextPage = () => setProductPage((p) => Math.min(productPagesCount, p + 1));

	const totalSelectedCount = Object.keys(selectedQuantities).length;

	// Handle Form submission logic
	const handleSubmit = async () => {
		if (!selectedWarehouse) {
			toast.show("error", "Please select a warehouse.");
			return;
		}
		if (totalSelectedCount === 0) {
			toast.show("error", "Please select at least one product.");
			return;
		}

		setIsSubmitting(true);
		try {
			const transactionsPayload = Object.entries(selectedQuantities).map(([productId, quantity]) => ({
				id: 0,
				productId: Number(productId),
				warehouseId: Number(selectedWarehouse.id),
				quantity: quantity,
				type: type as "in" | "out",
				date: new Date(),
			})) as unknown as Array<Transaction>;

			const response = await createTransaction(transactionsPayload);

			if (response.success) {
				toast.show("success", "Transaction logged successfully!");
				router.push("/dashboard/transactions");
				router.refresh();
			} else {
				toast.show("error", response.message || "Failed to process transaction.");
			}
		} catch (error) {
			console.error(error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Transactions", url: "/dashboard/transactions" },
					{ label: `New ${type}bound transaction`, url: "/dashboard/transactions/create" },
				]}
			/>

			{/* header */}
			<Flex width="100%" direction={{ initial: "column", sm: "row" }} align={{ initial: "start", sm: "center" }} justify="between" wrap="wrap" gap="4">
				<Flex direction="column" gap="1" className="flex-1">
					<Text size="6" weight="bold" className="select-none">
						New {type}bound transaction
					</Text>
					<Text size="3" className="select-none text-[var(--gray-10)]">
						{type === "in"
							? "Log incoming inventory into your network. Select a product, target warehouse, and specify the received quantity."
							: "Record stock fulfillment or removal. Select a product, source warehouse, and specify the dispatched quantity."}
					</Text>
				</Flex>
			</Flex>

			{/* warehouse & products core loader status wrappers */}
			{isLoading && (
				<Text size="2" color="gray" className="select-none" mt="4">
					Loading warehouses & products...
				</Text>
			)}

			{!isLoading && (warehouses.length === 0 || products.length === 0) && (
				<Text size="2" color="gray" className="select-none" mt="4">
					Cannot create {type}bound transaction. Please ensure you have at least 1 <Link href="/dashboard/warehouses">warehouse</Link> and{" "}
					<Link href="/dashboard/products">product</Link>.
				</Text>
			)}

			{!isLoading && warehouses.length > 0 && products.length > 0 && (
				<Flex width="100%" direction={{ initial: "column", md: "row" }} align="start" justify="between" wrap="wrap" gap="6" mt="4">
					{/* 🏢 LEFT PANEL: Warehouses (Strict 30% width split on desktop) */}
					<Flex direction="column" gap="1" className="w-full md:w-auto md:max-w-[30%] shrink-0">
						<Text size="2" weight="bold" className="select-none">
							{type === "in" ? "Destination" : "Source"} warehouse
						</Text>

						<RadioGroup.Root
							value={selectedWarehouse ? String(selectedWarehouse.id) : ""}
							onValueChange={(value) => {
								const selected = warehouses.find((warehouse) => String(warehouse.id) === value);
								if (selected) setSelectedWarehouse(selected);
							}}
						>
							<Flex direction="column" gap="2">
								{warehouses.map((warehouse) => (
									<Text as="label" key={warehouse.id} size="2" className="flex items-center gap-2 !cursor-pointer select-none">
										<RadioGroup.Item value={String(warehouse.id)} className="select-none" />
										{warehouse.name}, {warehouse.location}
									</Text>
								))}
							</Flex>
						</RadioGroup.Root>
					</Flex>

					{/* 📦 RIGHT PANEL: Products Segment (Takes remaining 70% on desktop) */}
					<Flex direction="column" gap="2" className="w-full md:flex-1 md:max-w-[70%] min-w-0">
						<Flex align="center" gap="2">
							<Text size="2" weight="bold" className="select-none">
								Products
							</Text>
							<Badge color={totalSelectedCount === 10 ? "red" : "amber"} className="select-none">
								{totalSelectedCount}/10 selected
							</Badge>
						</Flex>

						{/* Search Input Bar */}
						<TextField.Root
							placeholder="Search products by name or barcode..."
							value={productSearch}
							onChange={(e) => {
								setProductSearch(e.target.value);
								setProductPage(1);
							}}
						>
							<TextField.Slot side="right">
								<MagnifyingGlassIcon width="16" height="16" />
							</TextField.Slot>
						</TextField.Root>

						{/* Products Dynamic List Mapping */}
						<Flex direction="column" gap="2" className="min-h-[200px]">
							{paginatedProducts.length === 0 ? (
								<Text size="2" color="gray" className="text-center py-4 select-none">
									No products found.
								</Text>
							) : (
								paginatedProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										quantity={selectedQuantities[product.id] || 0}
										onQtyChange={(val) => handleQtyChange(String(product.id), val)}
										isLimitReached={totalSelectedCount >= 10}
									/>
								))
							)}
						</Flex>

						{/* pagination controls */}
						{productPagesCount > 1 && (
							<Flex align="center" justify="center" gap="2">
								<IconButton
									size="1"
									variant="soft"
									color="gray"
									className="!cursor-pointer"
									disabled={productPage === 1}
									onClick={handlePrevPage}
								>
									<ChevronLeftIcon width="12" height="12" />
								</IconButton>
								<Text size="1" color="gray" className="select-none">
									Page <Strong className="text-[var(--gray-12)]">{productPage}</Strong> of {productPagesCount}
								</Text>
								<IconButton
									size="1"
									variant="soft"
									color="gray"
									className="!cursor-pointer"
									disabled={productPage === productPagesCount}
									onClick={handleNextPage}
								>
									<ChevronRightIcon width="12" height="12" />
								</IconButton>
							</Flex>
						)}
					</Flex>
				</Flex>
			)}

			{!isLoading && warehouses.length > 0 && products.length > 0 && (
				<Flex gap="3" justify="end" mt="5" width="100%" className="border-t border-[var(--gray-4)] pt-4">
					<Button
						variant="soft"
						color="gray"
						className="!cursor-pointer"
						disabled={isSubmitting}
						onClick={() => router.push("/dashboard/transactions")}
					>
						Cancel
					</Button>
					<Button
						color={type === "in" ? "green" : "red"}
						className="!cursor-pointer"
						loading={isSubmitting}
						disabled={totalSelectedCount === 0 || !selectedWarehouse}
						onClick={handleSubmit}
					>
						Process {type}bound ({totalSelectedCount} items)
					</Button>
				</Flex>
			)}
		</>
	);
}

// local components
type ProductCardProps = {
	product: Product;
	quantity: number;
	onQtyChange: (val: number) => void;
	isLimitReached: boolean;
};

const ProductCard = ({ product, quantity, onQtyChange, isLimitReached }: ProductCardProps) => {
	const isChosen = quantity > 0;

	return (
		<Card size="1" className={`transition-colors ${isChosen ? "bg-[var(--accent-2)] border-[var(--accent-6)]" : "bg-[var(--gray-2)]"}`}>
			<Flex align="center" justify="between" width="100%">
				{/* Info block */}
				<Flex direction="column" className="min-w-0 flex-1 pr-3 select-none">
					<Text size="2" weight="bold" className="truncate text-[var(--gray-12)]">
						{product.name}
					</Text>
					{product.barcode && (
						<Text size="1" color="gray" className="font-mono truncate">
							{product.barcode}
						</Text>
					)}
				</Flex>

				{/* Direct Counter Control Strip */}
				<Flex align="center" gap="2">
					<IconButton
						size="1"
						variant="ghost"
						color="gray"
						className="!cursor-pointer"
						disabled={quantity === 0}
						onClick={() => onQtyChange(quantity - 1)}
					>
						<MinusIcon width="12" height="12" />
					</IconButton>

					<TextField.Root
						size="1"
						color="gray"
						variant="soft"
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={quantity}
						onChange={(e) => {
							const val = e.target.value.replace(/\D/g, "");
							const parsedVal = parseInt(val) || 0;

							if (parsedVal > 1000000) {
								onQtyChange(1000000);
							} else {
								onQtyChange(parsedVal);
							}
						}}
						className={`text-center !grow-0 shrink-0 min-w-[36px] max-w-[90px] w-[calc(${quantity.toString().length}ch+16px)]`}
					/>

					<IconButton
						size="1"
						variant="ghost"
						color="gray"
						className="!cursor-pointer"
						disabled={(!isChosen && isLimitReached) || quantity >= 1000000}
						onClick={() => onQtyChange(quantity + 1)}
					>
						<PlusIcon width="12" height="12" />
					</IconButton>
				</Flex>
			</Flex>
		</Card>
	);
};
