"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text } from "@radix-ui/themes";
import { HomeIcon, Link2Icon, PlusIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { Searchbar } from "@/components/Searchbar";
import { ListCard } from "@/components/ListCard";
import { Pagination } from "@/components/Pagination";

// actions
import { getRole } from "../actions";
import { getWarehouses } from "./actions";

// types
import type { UserRole } from "../actions";
import type { Warehouse } from "./actions";

// data
const sorts: Record<string, string> = {
	"name-ascending": "Name (A-Z)",
	"name-descending": "Name (Z-A)",
	"location-ascending": "Location (A-Z)",
	"location-descending": "Location (Z-A)",
	"id-descending": "Newest",
	"id-ascending": "Oldest",
};

export default function Page() {
	const router = useRouter();
	const toast = useToast();

	const [role, setRole] = useState<UserRole | null>(null);
	const [warehouses, setWarehouses] = useState<Array<Warehouse>>([]);

	const [page, setPage] = useState<number>(1);
	const [search, setSearch] = useState<string>("");
	const [sortMode, setSortMode] = useState<string>("name-ascending");

	const [isLoading, setIsLoading] = useState<boolean>(true);

	const isAdmin: boolean = role === 1;

	// get role & warehouses
	const toastRef = useRef(toast);
	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	useEffect(() => {
		let isMounted: boolean = true;
		setIsLoading(true);

		Promise.all([getRole(), getWarehouses()])
			.then(([role, warehousesResponse]) => {
				if (!isMounted) return;

				setRole(role as UserRole);

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

	// warehouse search
	const searchedWarehouses: Array<Warehouse> = warehouses.filter((warehouse: Warehouse) => {
		const expression: RegExp = new RegExp(/[\s\-_]/g); // remove whitespace, hyphens, & underlines

		const term: string = search.toLowerCase().replace(expression, "");
		if (!term) return true;

		const name: string = (warehouse.name || "").toLowerCase().replace(expression, "");
		const location: string = (warehouse.location || "").toLowerCase().replace(expression, "");

		return name.includes(term) || location.includes(term);
	});

	// warehouse sort
	const sortedWarehouses: Array<Warehouse> = [...searchedWarehouses].sort((warehouseA: Warehouse, warehouseB: Warehouse) => {
		switch (sortMode) {
			case "name-ascending":
				return warehouseA.name.localeCompare(warehouseB.name);
			case "name-descending":
				return warehouseB.name.localeCompare(warehouseA.name);
			case "location-ascending":
				return warehouseA.location.localeCompare(warehouseB.location);
			case "location-descending":
				return warehouseB.location.localeCompare(warehouseA.location);
			case "id-descending":
				return warehouseB.id - warehouseA.id;
			case "id-ascending":
				return warehouseA.id - warehouseB.id;
			default:
				return 0;
		}
	});

	// warehouse pagination
	const pages: number = Math.ceil(sortedWarehouses.length / 10) || 1;
	const startIndex: number = (page - 1) * 10;
	const endIndex: number = startIndex + 10;

	const paginatedWarehouses: Array<Warehouse> = sortedWarehouses.slice(startIndex, endIndex);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Warehouses", url: "/dashboard/warehouses" },
				]}
			/>

			{/* header */}
			<Header
				title="Warehouses"
				description="Manage your physical fullfillment centers, monitor regional infrastructure storage, and audit invetory allocations across storage locations."
				buttons={[
					{
						isShown: isAdmin,
						button: (
							<Button className="!cursor-pointer" onClick={() => router.push("/dashboard/warehouses/create")}>
								<PlusIcon width="16" height="16" />
								Create warehouse
							</Button>
						),
					},
				]}
			/>

			{/* search & sort */}
			{!isLoading && warehouses.length > 0 && (
				<Searchbar
					search={search}
					searchPlaceholder="Search warehouse.."
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					sortMode={sortMode}
					onSortChange={setSortMode}
					sortOptions={sorts}
					sortSeparators={["name-descending", "location-descending"]}
				/>
			)}

			{/* warehouses */}
			<Flex width="100%" direction="column" gap="2">
				{isLoading && (
					<Text size="2" color="gray" className="select-none">
						Loading warehouses...
					</Text>
				)}

				{!isLoading && searchedWarehouses.length === 0 && (
					<Text size="2" color="gray" className="select-none">
						No warehouses found.
					</Text>
				)}

				{!isLoading && sortedWarehouses.length > 0 && (
					<>
						<Text size="2" color="gray" weight="medium" className="select-none">
							{sortedWarehouses.length} warehouse{sortedWarehouses.length > 1 ? "s" : ""}
						</Text>
						{paginatedWarehouses.map((warehouse: Warehouse) => (
							<ListCard
								key={warehouse.id}
								link={`/dashboard/warehouses/${warehouse.id}`}
								icon={<HomeIcon width="24" height="24" />}
								title={warehouse.name}
								description={warehouse.location}
								options={[
									{
										type: "item",
										label: "Copy link",
										icon: <Link2Icon width="16" height="16" />,
										onClick: () => {
											if (typeof window !== "undefined") {
												navigator.clipboard.writeText(`${window.location.origin}/dashboard/warehouses/${warehouse.id}`);
												toast.show("success", "Link copied.");
											}
										},
									},
								]}
							/>
						))}
					</>
				)}
			</Flex>

			{/* pagination */}
			{!isLoading && warehouses.length > 0 && (
				<Flex width="100%" align="center" justify="center">
					<Pagination page={page} pages={pages} onPageChange={setPage} />
				</Flex>
			)}
		</>
	);
}
