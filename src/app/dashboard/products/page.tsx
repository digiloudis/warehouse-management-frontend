"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text } from "@radix-ui/themes";
import { ArchiveIcon, CopyIcon, CubeIcon, Link2Icon, PlusIcon } from "@radix-ui/react-icons";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { Searchbar } from "@/components/Searchbar";
import ListCard from "@/components/ListCard";
import Pagination from "@/components/Pagination";

// actions
import { getRole } from "../actions";
import { getProducts } from "./actions";

// types
import type { UserRole } from "../actions";
import type { Product } from "./actions";

// data
const sorts: Record<string, string> = {
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

	const [role, setRole] = useState<UserRole | null>(null);
	const [products, setProducts] = useState<Array<Product>>([]);

	const [page, setPage] = useState<number>(1);
	const [search, setSearch] = useState<string>("");
	const [sortMode, setSortMode] = useState<string>("name-ascending");

	const [isLoading, setIsLoading] = useState<boolean>(true);

	const isAdmin: boolean = role === 1;
	const isManager: boolean = role === 2;

	// get role & products
	useEffect(() => {
		let isMounted: boolean = true;
		setIsLoading(true);

		Promise.all([getRole(), getProducts()])
			.then(([role, productsResponse]) => {
				if (!isMounted) return;

				setRole(role as UserRole);

				if (productsResponse && productsResponse.success) {
					setProducts(productsResponse.data ?? []);
				} else {
					toast.show("error", productsResponse?.message || "Failed to fetch products.");
					setProducts([]);
				}
			})
			.catch((error) => {
				if (!isMounted) return;

				console.error(error);
				toast.show("error", "Something went wrong while loading data.");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [toast]);

	// product search
	const searchedProducts: Array<Product> = products.filter((product: Product) => {
		const expression: RegExp = new RegExp(/[\s\-_]/g); // remove whitespace, hyphens, & underlines

		const term: string = search.toLowerCase().replace(expression, "");
		if (!term) return true;

		const name: string = (product.name || "").toLowerCase().replace(expression, "");
		const barcode: string = (product.barcode || "").toLowerCase().replace(expression, "");

		return name.includes(term) || barcode.includes(term);
	});

	// product sort
	const sortedProducts: Array<Product> = [...searchedProducts].sort((productA: Product, productB: Product) => {
		switch (sortMode) {
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
	const pages: number = Math.ceil(sortedProducts.length / 10) || 1;
	const startIndex: number = (page - 1) * 10;
	const endIndex: number = startIndex + 10;

	const paginatedProducts: Array<Product> = sortedProducts.slice(startIndex, endIndex);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Products", url: "/dashboard/products" },
				]}
			/>

			{/* header */}
			<Header
				title="Products"
				description="Manage your product catalog, track stock levels, and monitor inventory movement across all locations."
				buttons={[
					{
						isShown: isAdmin || isManager,
						button: (
							<Button className="!cursor-pointer" onClick={() => router.push("/dashboard/products/create")}>
								<PlusIcon width="16" height="16" />
								Create product
							</Button>
						),
					},
				]}
			/>

			{/* search & sort */}
			{!isLoading && products.length > 0 && (
				<Searchbar
					search={search}
					searchPlaceholder="Search product.."
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					sortMode={sortMode}
					onSortChange={setSortMode}
					sortOptions={sorts}
					sortSeparators={["name-descending", "price-ascending"]}
				/>
			)}

			{/* products */}
			<Flex width="100%" direction="column" gap="2">
				{isLoading && (
					<Text size="2" color="gray" className="select-none">
						Loading products...
					</Text>
				)}

				{!isLoading && searchedProducts.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No products found.
					</Text>
				)}

				{!isLoading && sortedProducts.length > 0 && (
					<>
						<Text size="2" color="gray" weight="medium" className="select-none">
							{sortedProducts.length} product{sortedProducts.length > 1 ? "s" : ""}
						</Text>
						{paginatedProducts.map((product: Product) => (
							<ListCard
								key={product.id}
								link={`/dashboard/products/${product.id}`}
								icon={<CubeIcon width="24" height="24" />}
								title={product.name}
								description={product.barcode}
								badge={`${product.price.toFixed(2)} €`}
								options={[
									{
										type: "item",
										label: "Duplicate",
										icon: <CopyIcon width="16" height="16" />,
										onClick: () => {
											const params = new URLSearchParams({
												name: `${product.name} (Copy)`,
												barcode: `${product.barcode}-COPY`,
												price: product.price.toString(),
											});
											router.push(`/dashboard/products/create?${params.toString()}`);
										},
									},
									{
										type: "item",
										label: "Copy link",
										icon: <Link2Icon width="16" height="16" />,
										onClick: () => {
											if (typeof window !== "undefined") {
												navigator.clipboard.writeText(`${window.location.origin}/dashboard/products/${product.id}`);
												toast.show("success", "Link copied.");
											}
										},
									},
									{ type: "separator" },
									{
										type: "item",
										label: "Archive",
										icon: <ArchiveIcon width="16" height="16" />,
										color: "red",
										onClick: () => {
											console.log("Archiving product:", product.id);
										},
									},
								]}
							/>
						))}
					</>
				)}
			</Flex>

			{/* pagination */}
			{!isLoading && products.length > 0 && <Pagination page={page} pages={pages} onPageChange={setPage} />}
		</>
	);
}
