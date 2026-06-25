"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Badge, Button, Flex, IconButton, Link, Text, Tooltip } from "@radix-ui/themes";
import { Cross1Icon, HomeIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { ListCard } from "@/components/ListCard";

// actions
import { createTransaction } from "../actions";
import { getProducts } from "../../products/actions";
import { getWarehouses } from "../../warehouses/actions";

// types
import type { Product } from "../../products/actions";
import type { Warehouse } from "../../warehouses/actions";
import { formatNumber } from "@/lib/format";
import { Searchbar } from "@/components/Searchbar";

// data
const productSorts: Record<string, string> = {
	"name-ascending": "Name (A-Z)",
	"name-descending": "Name (Z-A)",
	"price-descending": "Price (Highest)",
	"price-ascending": "Price (Lowest)",
	"id-descending": "Newest",
	"id-ascending": "Oldest",
};

export default function Page() {
	const router = useRouter();
	const toast = useToast();
	const params = useSearchParams();

	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);
	const [products, setProducts] = useState<Array<Product>>([]);

	const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
	const [selectedProducts, setSelectedProducts] = useState<Map<Product, number>>(new Map());

	const [warehousePage, setWarehousePage] = useState<number>(1);
	const [productPage, setProductPage] = useState<number>(1);
	const [productSearch, setProductSearch] = useState<string>("");
	const [productSortMode, setProductSortMode] = useState<string>("name-ascending");

	const [isLoading, setIsLoading] = useState<boolean>(true);

	const type: string = params.get("type") || "in";

	const isInbound: boolean = type === "in";
	const isProductLimitReached: boolean = selectedProducts.size === 10;

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const isHoldingRef = useRef<boolean>(false);

	const stopCounter = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setTimeout(() => {
			isHoldingRef.current = false;
		}, 50);
	};

	// get products, & warehouses
	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		setIsLoading(true);

		Promise.all([getWarehouses(), getProducts(false)])
			.then(([warehousesResponse, productsResponse]) => {
				if (!warehousesResponse.success) {
					toast.show("error", warehousesResponse.message);
					setWarehouses([]);
				} else setWarehouses(warehousesResponse.data ?? []);

				if (!productsResponse.success) {
					toast.show("error", productsResponse.message);
					setProducts([]);
				} else setProducts(productsResponse.data ?? []);
			})
			.catch((error) => {
				console.error(error);
				toast.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));
	}, []);

	// warehouse pagination
	const warehousePages: number = Math.ceil(warehouses.length / 10) || 1;
	const warehouseStartIndex: number = (warehousePage - 1) * 10;
	const warehouseEndIndex: number = warehouseStartIndex + 10;

	const paginatedWarehouses: Array<Warehouse> = warehouses.slice(warehouseStartIndex, warehouseEndIndex);

	// product search
	const searchedProducts: Array<Product> = products.filter((product: Product) => {
		const expression: RegExp = new RegExp(/[\s\-_]/g); // remove whitespace, hyphens, & underlines

		const term: string = productSearch.toLowerCase().replace(expression, "");
		if (!term) return true;

		const name: string = (product.name || "").toLowerCase().replace(expression, "");
		const barcode: string = (product.barcode || "").toLowerCase().replace(expression, "");

		return name.includes(term) || barcode.includes(term);
	});

	// product sort
	const sortedProducts: Array<Product> = [...searchedProducts].sort((productA: Product, productB: Product) => {
		switch (productSortMode) {
			case "name-ascending":
				return productA.name.localeCompare(productB.name);
			case "name-descending":
				return productB.name.localeCompare(productA.name);
			case "price-ascending":
				return productA.price - productB.price;
			case "price-descending":
				return productB.price - productA.price;
			case "id-descending":
				return productB.id - productA.id;
			case "id-ascending":
				return productA.id - productB.id;
			default:
				return 0;
		}
	});

	// product pagination
	const productPages: number = Math.ceil(sortedProducts.length / 10) || 1;
	const productStartIndex: number = (productPage - 1) * 10;
	const productEndIndex: number = productStartIndex + 10;

	const paginatedProducts: Array<Product> = sortedProducts.slice(productStartIndex, productEndIndex);

	// product counter controls
	const findProductInMap = (map: Map<Product, number>, id: number) => {
		for (const key of map.keys()) if (key.id === id) return key;
		return null;
	};

	const handleAddProduct = (product: Product, amount: number = 1) => {
		setSelectedProducts((previous: Map<Product, number>) => {
			const nextMap: Map<Product, number> = new Map(previous);
			const mapKey: Product = findProductInMap(nextMap, product.id) || product;

			const quantity: number = nextMap.get(mapKey) || 0;
			if (quantity >= 1000000) return previous;

			if (quantity === 0 && nextMap.size >= 10) {
				toast.show("error", "You can only select up to 10 products.");
				return previous;
			}

			nextMap.set(mapKey, Math.min(1000000, quantity + amount));
			return nextMap;
		});
	};

	const handleRemoveProduct = (product: Product, amount: number = 1) => {
		setSelectedProducts((previous) => {
			const nextMap: Map<Product, number> = new Map(previous);
			const mapKey: Product | null = findProductInMap(nextMap, product.id) || product;
			if (!mapKey) return previous;

			const quantity: number = nextMap.get(mapKey) || 0;
			if (quantity <= amount) nextMap.delete(mapKey);
			else nextMap.set(mapKey, quantity - amount);

			return nextMap;
		});
	};

	const startCounter = (action: () => void) => {
		stopCounter();
		timerRef.current = setTimeout(() => {
			isHoldingRef.current = true;
			timerRef.current = setInterval(action, 50);
		}, 350);
	};

	const handleCreateTransaction = async () => {
		if (!selectedWarehouse) {
			toast.show("error", "Please select a warehouse.");
			return;
		}
		if (selectedProducts.size === 0) {
			toast.show("error", "Please select at least one product.");
			return;
		}

		setIsLoading(true);

		const transactionsData = Array.from(selectedProducts.entries()).map(([product, qty]) => ({
			type: type,
			warehouseId: selectedWarehouse.id,
			productId: product.id,
			quantity: qty,
		}));

		try {
			const response = await createTransaction(transactionsData);

			if (response.success) {
				toast.show("success", "Transactions processed successfully.");
				router.push("/dashboard/transactions");
			} else {
				toast.show("error", response.message || "Failed to process transactions.");
			}
		} catch (error) {
			console.error(error);
			toast.show("error", "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
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
			<Header
				title={`New ${type}bound transaction`}
				description={
					isInbound
						? "Log incoming inventory into your network. Select a product, target warehouse, and specify the received quantity. Hold buttons to modify by 100."
						: "Record stock fulfillment or removal. Select a product, source warehouse, and specify the dispatched quantity. Hold buttons to modify by 100."
				}
			/>

			{isLoading && (
				<Text size="2" color="gray" className="select-none">
					Loading warehouses & products...
				</Text>
			)}

			{!isLoading && (warehouses.length === 0 || products.length === 0) && (
				<Text size="2" color="gray" className="select-none">
					Cannot create {type}bound transaction. Please ensure you have at least 1{" "}
					<Link href="#" onClick={() => router.push("/dashboard/warehouses")}>
						warehouse
					</Link>{" "}
					and{" "}
					<Link href="#" onClick={() => router.push("/dashboard/products")}>
						product
					</Link>
					.
				</Text>
			)}

			{/* warehouses */}
			{!isLoading && warehouses.length > 0 && products.length > 0 && (
				<Flex width="100%" direction="column" gap="2">
					<Flex width="100%" justify="between" align="center" wrap="wrap">
						<Text size="2" weight="bold" className="select-none">
							{isInbound ? "Destination" : "Source"} warehouse <Text color="red">*</Text>
						</Text>
						<Pagination page={warehousePage} pages={warehousePages} onPageChange={setWarehousePage} />
					</Flex>

					<Flex width="100%" direction="column" gap="2">
						{paginatedWarehouses.map((warehouse: Warehouse) => {
							const isSelected: boolean = selectedWarehouse?.id === warehouse.id;

							return (
								<ListCard
									key={warehouse.id}
									icon={<HomeIcon width="24" height="24" />}
									iconColor={isSelected ? "green" : "amber"}
									title={warehouse.name}
									titleLink={`/dashboard/warehouses/${warehouse.id}`}
									description={warehouse.location}
									badge={isSelected ? "Selected" : undefined}
									badgeColor="green"
									onClick={() => setSelectedWarehouse(warehouse)}
								/>
							);
						})}
					</Flex>
				</Flex>
			)}

			{/* products */}
			{!isLoading && warehouses.length > 0 && products.length > 0 && (
				<Flex width="100%" direction="column" gap="2">
					<Flex width="100%" justify="between" align="center" wrap="wrap" className="select-none">
						<Flex gap="2">
							<Text size="2" weight="bold">
								Products <Text color="red">*</Text>
							</Text>
							<Badge color={isProductLimitReached ? "red" : "amber"}>{selectedProducts.size}/10 products</Badge>
						</Flex>
						<Pagination page={productPage} pages={productPages} onPageChange={setProductPage} />
					</Flex>

					{/* search & sort */}
					{!isLoading && products.length > 0 && (
						<Searchbar
							search={productSearch}
							searchPlaceholder="Search product.."
							onSearchChange={(value) => {
								setProductSearch(value);
								setProductPage(1);
							}}
							sortMode={productSortMode}
							onSortChange={setProductSortMode}
							sortOptions={productSorts}
							sortSeparators={["name-descending", "price-ascending"]}
						/>
					)}

					<Flex width="100%" direction="column" gap="2">
						{paginatedProducts.map((product: Product) => {
							const mapKey: Product | null = findProductInMap(selectedProducts, product.id);
							const quantity: number = mapKey ? selectedProducts.get(mapKey) || 0 : 0;
							const isSelected: boolean = quantity > 0;

							return (
								<Flex gap="2" key={product.id} align="center">
									<Flex flexGrow="1" className="min-w-0">
										<ListCard
											icon={<HomeIcon width="24" height="24" />}
											iconColor={isSelected ? "green" : "amber"}
											title={product.name}
											titleLink={`/dashboard/products/${product.id}`}
											description={product.barcode}
											badge={isSelected ? formatNumber(quantity) : undefined}
											badgeTooltip={isSelected && quantity > 999 ? quantity.toLocaleString() : undefined}
											onClick={() => {
												if (!isHoldingRef.current) handleAddProduct(product, 1);
											}}
										/>
									</Flex>

									{/* count controls */}
									<Flex direction="column" justify="center" gap="1" className="shrink-0">
										{/* add button */}
										<Tooltip content="Add product">
											<IconButton
												size="1"
												variant="soft"
												color="gray"
												className="!cursor-pointer"
												disabled={quantity >= 1000000 || (!isSelected && isProductLimitReached)}
												onClick={() => {
													if (!isHoldingRef.current) handleAddProduct(product, 1);
												}}
												onMouseDown={() => startCounter(() => handleAddProduct(product, 100))}
												onMouseUp={stopCounter}
												onMouseLeave={stopCounter}
												onTouchStart={(event) => {
													event.preventDefault();
													startCounter(() => handleAddProduct(product, 100));
												}}
												onTouchEnd={(event) => {
													event.preventDefault();
													stopCounter();
												}}
											>
												<PlusIcon width="12" height="12" />
											</IconButton>
										</Tooltip>

										{/* remove button */}
										<Tooltip content="Remove product">
											<IconButton
												size="1"
												variant="soft"
												color="gray"
												className="!cursor-pointer"
												disabled={!isSelected}
												onClick={() => {
													if (!isHoldingRef.current) handleRemoveProduct(product, 1);
												}}
												onMouseDown={() => startCounter(() => handleRemoveProduct(product, 100))}
												onMouseUp={stopCounter}
												onMouseLeave={stopCounter}
												onTouchStart={(event) => {
													event.preventDefault();
													startCounter(() => handleRemoveProduct(product, 100));
												}}
												onTouchEnd={(event) => {
													event.preventDefault();
													stopCounter();
												}}
											>
												<MinusIcon width="12" height="12" />
											</IconButton>
										</Tooltip>
									</Flex>
								</Flex>
							);
						})}
					</Flex>
				</Flex>
			)}

			{/* buttons */}
			<Flex width="100%" justify="end" gap="2" className="mt-4">
				<Button
					variant="soft"
					size="2"
					color="gray"
					type="button"
					disabled={isLoading}
					className="!cursor-pointer"
					onClick={() => router.push("/dashboard/transactions")}
				>
					<Cross1Icon width="12" height="12" />
					Cancel
				</Button>
				<Button
					size="2"
					type="button"
					loading={isLoading}
					className="!cursor-pointer"
					disabled={isLoading || !selectedWarehouse || selectedProducts.size === 0}
					onClick={handleCreateTransaction}
				>
					<PlusIcon width="12" height="12" />
					Create
				</Button>
			</Flex>
		</>
	);
}
