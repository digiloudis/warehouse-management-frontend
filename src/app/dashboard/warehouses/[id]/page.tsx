"use client";

import { useEffect, useState, use } from "react";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { ArrowLeftIcon, CubeIcon } from "@radix-ui/react-icons";
import Link from "next/link";

// components
import { Navigation } from "@/components/Navigation";
import { Content } from "@/components/Content";
import Label from "@/components/Label";

// actions
import { getWarehouseInventory } from "./actions";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function WarehouseDetailsPage({ params }: PageProps) {
	const { id } = use(params);

	const [inventory, setInventory] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const result = await getWarehouseInventory(id);
			if (result.success) {
				setInventory(result.data);
			}
			setLoading(false);
		})();
	}, [id]);

	// Υπολογισμοί για τα Quick Stats
	const totalStock = inventory.reduce((acc, item) => acc + item.quantity, 0);
	const totalWarehouseValue = inventory.reduce((acc, item) => acc + (item.totalValue || 0), 0);

	return (
		<>
			<Navigation />
			<Content>
				{/* 1. Breadcrumb */}
				<Box>
					<Link
						href="/dashboard/warehouses"
						className="inline-flex items-center gap-2 text-[var(--gray-10)] hover:text-[var(--slate-12)] transition-colors text-sm font-medium"
					>
						<ArrowLeftIcon /> Back to Warehouses
					</Link>
				</Box>

				{/* 2. Header */}
				<Flex justify="between" align="end">
					<Flex direction="column" gap="1">
						<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
							Warehouse Details
						</Label>
						<Label size="3" className="text-[var(--gray-10)]">
							Viewing current stock levels for Warehouse ID: #{id}
						</Label>
					</Flex>
				</Flex>

				{/* 3. Quick Stats (Τώρα με 3 στήλες) */}
				<Grid columns={{ initial: "1", sm: "3" }} gap="4">
					<Box className="p-4 bg-[var(--gray-3)] rounded-[var(--radius-3)]">
						<Label size="2" color="gray" className="block">
							Unique Products
						</Label>
						<Label size="6" weight="bold" className="block mt-1 text-[var(--slate-12)]">
							{inventory.length}
						</Label>
					</Box>
					<Box className="p-4 bg-[var(--gray-3)] rounded-[var(--radius-3)]">
						<Label size="2" color="gray" className="block">
							Total Units
						</Label>
						<Label size="6" weight="bold" className="block mt-1 text-[var(--slate-12)]">
							{totalStock} pcs
						</Label>
					</Box>
					<Box className="p-4 bg-[var(--gray-3)] rounded-[var(--radius-3)]">
						<Label size="2" color="gray" className="block">
							Stock Value
						</Label>
						<Label size="6" weight="bold" className="block mt-1 text-[var(--slate-12)]">
							€{totalWarehouseValue.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
						</Label>
					</Box>
				</Grid>

				{/* 4. Section Title */}
				<Box mt="4">
					<Label size="5" weight="bold" className="block text-[var(--slate-12)]">
						Stored Products
					</Label>
					<Label size="2" color="gray">
						Inventory breakup with active pricing and barcodes.
					</Label>
				</Box>

				{/* 5. Inventory List */}
				<Flex direction="column" gap="2">
					{loading ? (
						<Box className="p-8 text-center bg-white border border-[var(--gray-5)] rounded-[var(--radius-3)]">
							<Label size="2" color="gray" className="animate-pulse">
								Loading enriched inventory...
							</Label>
						</Box>
					) : inventory.length === 0 ? (
						<Box className="p-8 text-center bg-[var(--gray-2)] border border-dashed border-[var(--gray-6)] rounded-[var(--radius-3)]">
							<Label size="3" weight="medium" color="gray" className="block mb-1">
								Empty Warehouse
							</Label>
							<Label size="2" color="gray">
								No products are currently registered here.
							</Label>
						</Box>
					) : (
						inventory.map((item, index) => (
							<Box
								key={index}
								className="p-4 bg-white border border-[var(--gray-5)] rounded-[var(--radius-3)] hover:border-[var(--gray-7)] transition-colors"
							>
								<Flex justify="between" align="center">
									{/* Αριστερό Μέρος: Info & Barcode */}
									<Flex align="center" gap="3">
										<Box className="p-2 bg-[var(--gray-3)] rounded-[var(--radius-2)] text-[var(--gray-10)]">
											<CubeIcon width="20" height="20" />
										</Box>
										<Box>
											<Label size="4" weight="bold" className="block text-[var(--slate-12)]">
												{item.productName}
											</Label>
											<Flex gap="2" className="mt-0.5">
												<Label size="2" color="gray">
													Barcode: {item.productBarcode}
												</Label>
												<Label size="2" className="text-[var(--gray-9)]">
													• Price: €{item.productPrice.toFixed(2)}
												</Label>
											</Flex>
										</Box>
									</Flex>

									{/* Δεξί Μέρος: Ποσότητα & Συνολική Αξία */}
									<Flex align="center" gap="5">
										<Box className="text-right">
											<Label size="1" color="gray" className="block">
												Value
											</Label>
											<Label size="3" weight="medium" className="text-[var(--gray-11)]">
												€{item.totalValue.toFixed(2)}
											</Label>
										</Box>
										<Box className="text-right min-w-[70px]">
											<Label size="1" color="gray" className="block">
												Quantity
											</Label>
											<Label size="4" weight="bold" className="text-[var(--slate-12)]">
												{item.quantity}
											</Label>
										</Box>
									</Flex>
								</Flex>
							</Box>
						))
					)}
				</Flex>
			</Content>
		</>
	);
}
