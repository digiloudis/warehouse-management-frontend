"use client";

import { useEffect, useState, use } from "react";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { ArrowLeftIcon, HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";

// components
import { Navigation } from "@/components/Navigation";
import { Content } from "@/components/Content";
import Label from "@/components/Label";

// actions
import { getProductDetails } from "./actions";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
	const { id } = use(params);

	const [product, setProduct] = useState<any>(null);
	const [locations, setLocations] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const result = await getProductDetails(id); // Ή όπως ονομάζεται το action σου
			if (result.success) {
				setProduct(result.product);

				// 🌟 Πρόσθεσε το || [] εδώ για να διώξεις το σφάλμα:
				setLocations(result.locations || []);
			}
			setLoading(false);
		})();
	}, [id]);

	const totalStock = locations.reduce((acc, item) => acc + item.quantity, 0);

	if (loading) {
		return (
			<>
				<Navigation />
				<Content>
					<Label size="2" color="gray" className="animate-pulse">
						Loading product details...
					</Label>
				</Content>
			</>
		);
	}

	if (!product) {
		return (
			<>
				<Navigation />
				<Content>
					<Label size="3" color="red">
						Product not found.
					</Label>
				</Content>
			</>
		);
	}

	return (
		<>
			<Navigation />
			<Content>
				{/* Breadcrumb */}
				<Box>
					<Link
						href="/dashboard/products"
						className="inline-flex items-center gap-2 text-[var(--gray-10)] hover:text-[var(--slate-12)] transition-colors text-sm font-medium"
					>
						<ArrowLeftIcon /> Back to Products
					</Link>
				</Box>

				{/* Header */}
				<Flex justify="between" align="end">
					<Flex direction="column" gap="1">
						<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
							{product.name}
						</Label>
						<Label size="3" className="text-[var(--gray-10)]">
							Product ID: #{id} • Barcode: {product.barcode || "N/A"}
						</Label>
					</Flex>
				</Flex>

				{/* Quick Info Cards */}
				<Grid columns={{ initial: "1", sm: "2" }} gap="4">
					<Box className="p-4 bg-[var(--gray-3)] rounded-[var(--radius-3)]">
						<Label size="2" color="gray" className="block">
							Unit Price
						</Label>
						<Label size="6" weight="bold" className="block mt-1 text-[var(--slate-12)]">
							€{product.price?.toFixed(2)}
						</Label>
					</Box>
					<Box className="p-4 bg-[var(--gray-3)] rounded-[var(--radius-3)]">
						<Label size="2" color="gray" className="block">
							Total Global Stock
						</Label>
						<Label size="6" weight="bold" className="block mt-1 text-[var(--slate-12)]">
							{totalStock} units
						</Label>
					</Box>
				</Grid>

				{/* Stock Location Section */}
				<Box mt="4">
					<Label size="5" weight="bold" className="block text-[var(--slate-12)]">
						Stock Distribution
					</Label>
					<Label size="2" color="gray">
						Where this product is currently stored and in what quantities.
					</Label>
				</Box>

				{/* Locations List */}
				<Flex direction="column" gap="2">
					{locations.length === 0 ? (
						<Box className="p-6 text-center bg-[var(--gray-2)] border border-dashed border-[var(--gray-6)] rounded-[var(--radius-3)]">
							<Label size="2" color="gray" className="italic">
								This product is currently not stocked in any warehouse.
							</Label>
						</Box>
					) : (
						locations.map((loc, index) => (
							<Box key={index} className="p-4 bg-white border border-[var(--gray-5)] rounded-[var(--radius-3)]">
								<Flex justify="between" align="center">
									<Flex align="center" gap="3">
										<Box className="p-2 bg-[var(--gray-3)] rounded-[var(--radius-2)] text-[var(--gray-10)]">
											<HomeIcon width="20" height="20" />
										</Box>
										<Box>
											<Label size="4" weight="bold" className="block text-[var(--slate-12)]">
												{loc.warehouseName || `Warehouse #${loc.warehouseId}`}
											</Label>
											<Label size="2" color="gray">
												Warehouse ID: {loc.warehouseId}
											</Label>
										</Box>
									</Flex>
									<Box className="text-right">
										<Label size="1" color="gray" className="block">
											Available Stock
										</Label>
										<Label size="4" weight="bold" className="text-[var(--slate-12)]">
											{loc.quantity} pcs
										</Label>
									</Box>
								</Flex>
							</Box>
						))
					)}
				</Flex>
			</Content>
		</>
	);
}
