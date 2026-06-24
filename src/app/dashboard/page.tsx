"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Card, Flex, Text, Grid, Badge } from "@radix-ui/themes";
import { HomeIcon, CubeIcon, Component1Icon, PersonIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";

// actions
import { getProducts } from "@/app/dashboard/products/actions";
import { getWarehouses } from "@/app/dashboard/warehouses/actions";
import { getTransactions } from "@/app/dashboard/transactions/actions";

// lib
import { formatNumber } from "@/lib/format";

export default function Page() {
	const router = useRouter();
	const toast = useToast();

	const [counts, setCounts] = useState({
		warehouses: 0,
		products: 0,
		transactions: 0,
		users: 14, // Random static count για τώρα
	});

	const [isLoading, setIsLoading] = useState<boolean>(true);

	// load metrics
	useEffect(() => {
		setIsLoading(true);

		Promise.all([getWarehouses(), getProducts(), getTransactions()])
			.then(([warehousesResponse, productsResponse, transactionsResponse]) => {
				setCounts({
					warehouses: warehousesResponse.success ? warehousesResponse.data?.length || 0 : 0,
					products: productsResponse.success ? productsResponse.data?.length || 0 : 0,
					transactions: transactionsResponse.success ? transactionsResponse.data?.length || 0 : 0,
					users: 14, // Διατήρηση του random number
				});

				if (!warehousesResponse.success || !productsResponse.success || !transactionsResponse.success) {
					toast.show("error", "Some dashboard metrics failed to load.");
				}
			})
			.catch((error) => {
				console.error(error);
				toast.show("error", "Something went wrong loading dashboard metrics.");
			})
			.finally(() => setIsLoading(false));
	}, []);

	return (
		<>
			{/* location */}
			<Breadcrumbs items={[{ label: "Dashboard", url: "/dashboard" }]} />

			{/* header */}
			<Flex width="100%" direction="column" gap="1" mb="4">
				<Text size="6" weight="bold" className="select-none">
					Overview
				</Text>
				<Text size="3" color="gray" className="select-none">
					Welcome to your inventory control network hub. Monitor global stats at a glance.
				</Text>
			</Flex>

			{/* metrics grid */}
			<Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4" width="100%">
				{/* warehouses card */}
				<Card size="2" className="!cursor-pointer hover:bg-[var(--gray-2)]" onClick={() => router.push("/dashboard/warehouses")}>
					<Flex align="center" justify="between" width="100%">
						<Flex direction="column" gap="1">
							<Text size="2" color="gray" weight="medium" className="select-none">
								Warehouses
							</Text>
							<Text size="6" weight="bold">
								{isLoading ? "..." : formatNumber(counts.warehouses)}
							</Text>
						</Flex>
						<Flex p="2" className="bg-[var(--blue-3)] text-[var(--blue-11)] rounded-[var(--radius-4)]">
							<HomeIcon width="24" height="24" />
						</Flex>
					</Flex>
				</Card>

				{/* products card */}
				<Card size="2" className="!cursor-pointer hover:bg-[var(--gray-2)]" onClick={() => router.push("/dashboard/products")}>
					<Flex align="center" justify="between" width="100%">
						<Flex direction="column" gap="1">
							<Text size="2" color="gray" weight="medium" className="select-none">
								Products
							</Text>
							<Text size="6" weight="bold">
								{isLoading ? "..." : formatNumber(counts.products)}
							</Text>
						</Flex>
						<Flex p="2" className="bg-[var(--orange-3)] text-[var(--orange-11)] rounded-[var(--radius-4)]">
							<CubeIcon width="24" height="24" />
						</Flex>
					</Flex>
				</Card>

				{/* transactions card */}
				<Card size="2" className="!cursor-pointer hover:bg-[var(--gray-2)]" onClick={() => router.push("/dashboard/transactions")}>
					<Flex align="center" justify="between" width="100%">
						<Flex direction="column" gap="1">
							<Text size="2" color="gray" weight="medium" className="select-none">
								Transactions
							</Text>
							<Text size="6" weight="bold">
								{isLoading ? "..." : formatNumber(counts.transactions)}
							</Text>
						</Flex>
						<Flex p="2" className="bg-[var(--green-3)] text-[var(--green-11)] rounded-[var(--radius-4)]">
							<Component1Icon width="24" height="24" />
						</Flex>
					</Flex>
				</Card>

				{/* users card */}
				<Card size="2">
					<Flex align="center" justify="between" width="100%">
						<Flex direction="column" gap="1">
							<Flex align="center" gap="2">
								<Text size="2" color="gray" weight="medium" className="select-none">
									Active Users
								</Text>
								<Badge color="gray" size="1">
									Mock
								</Badge>
							</Flex>
							<Text size="6" weight="bold">
								{isLoading ? "..." : formatNumber(counts.users)}
							</Text>
						</Flex>
						<Flex p="2" className="bg-[var(--purple-3)] text-[var(--purple-11)] rounded-[var(--radius-4)]">
							<PersonIcon width="24" height="24" />
						</Flex>
					</Flex>
				</Card>
			</Grid>
		</>
	);
}
