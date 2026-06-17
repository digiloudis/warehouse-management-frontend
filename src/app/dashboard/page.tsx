"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Section } from "@radix-ui/themes";

// components
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/Card";

// actions
import { getProductCount, getTransactionCount } from "./actions";
import { getWarehouses } from "@/app/dashboard/warehouses/actions";

// lib
import { formatNumber } from "@/lib/format";

export default function Page() {
	const [warehouseCount, setWarehouseCount] = useState<number | null>(null);
	const [productCount, setProductCount] = useState<number | null>(null);
	const [transactionCount, setTransactionCount] = useState<number | null>(null);

	useEffect(() => {
		(async () => {
			const [warehouseResult, productResult, transactionResult] = await Promise.all([getWarehouses(), getProductCount(), getTransactionCount()]);

			// Ενημέρωση των states
			setWarehouseCount(warehouseResult.count ?? 0);
			setProductCount(productResult.count ?? 0);
			setTransactionCount(transactionResult.count ?? 0);
		})();
	}, []);

	return (
		<>
			<Navigation />
			{/* stats */}
			<Container size="4" px="4">
				<Section size="2">
					<Grid columns={{ initial: "1", sm: "3", lg: "3" }} gap="4" width="auto">
						<Card title={warehouseCount !== null ? formatNumber(warehouseCount) : "..."} description="Warehouses" href="/dashboard/warehouses" />
						<Card title={productCount !== null ? formatNumber(productCount) : "..."} description="Products" href="/dashboard/products" />
						<Card
							title={transactionCount !== null ? formatNumber(transactionCount) : "..."}
							description="Transactions"
							href="/dashboard/transactions"
						/>
					</Grid>
				</Section>
			</Container>
		</>
	);
}
