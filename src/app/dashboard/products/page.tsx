"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, IconButton, Card } from "@radix-ui/themes";
import { PlusIcon, CubeIcon, TrashIcon } from "@radix-ui/react-icons";

// components
import { Navigation } from "@/components/Navigation";
import { Content } from "@/components/Content";
import Label from "@/components/Label";
import Button from "@/components/Button";

// actions
import { getProducts, deleteProduct } from "./actions";

export default function ProductsPage() {
	const router = useRouter();
	const [products, setProducts] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	const fetchProducts = async () => {
		setLoading(true);
		const result = await getProducts();
		if (result.success) setProducts(result.data);
		setLoading(false);
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleDelete = async (id: string | number) => {
		if (confirm("Are you sure you want to delete this product?")) {
			const result = await deleteProduct(id);
			if (result.success) {
				fetchProducts();
			} else {
				alert(result.error || "Failed to delete product.");
			}
		}
	};

	return (
		<>
			<Navigation />
			<Content>
				{/* Header */}
				<Flex justify="between" align="end" mb="4">
					<Flex direction="column" gap="2">
						<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
							Products
						</Label>
						<Label size="3" className="text-[var(--gray-10)]">
							Manage your global product catalog, pricing, and barcodes.
						</Label>
					</Flex>
					<Box mb="1">
						<Button className="cursor-pointer" onClick={() => router.push("/dashboard/products/create")}>
							<PlusIcon /> Create Product
						</Button>
					</Box>
				</Flex>

				{/* List */}
				<Flex direction="column" gap="3">
					{loading ? (
						<Label size="2" color="gray" className="animate-pulse">
							Loading catalog...
						</Label>
					) : products.length === 0 ? (
						<Label size="2" color="gray" className="italic text-center p-4">
							No products found.
						</Label>
					) : (
						products.map((product) => {
							const currentId = product.id ?? product.productId;
							return (
								<Card key={currentId} variant="surface" className="p-4 transition-colors">
									<Flex justify="between" align="center">
										<Flex align="center" gap="3">
											<Box className="p-2 bg-[var(--gray-3)] rounded-[var(--radius-2)] text-[var(--gray-10)]">
												<CubeIcon width="20" height="20" />
											</Box>
											<Box>
												<Label size="4" weight="bold" className="block text-[var(--slate-12)]">
													{product.name}
												</Label>
												<Label size="2" color="gray">
													Barcode: {product.barcode}
												</Label>
											</Box>
										</Flex>

										<Flex align="center" gap="4">
											<Label size="3" weight="bold" className="text-[var(--slate-12)]">
												€{product.price?.toFixed(2)}
											</Label>

											{/* 🌟 Απλό κουμπί Delete αντί για Dropdown Menu */}
											<IconButton variant="ghost" color="red" className="cursor-pointer" onClick={() => handleDelete(currentId)}>
												<TrashIcon width="18" height="18" />
											</IconButton>
										</Flex>
									</Flex>
								</Card>
							);
						})
					)}
				</Flex>
			</Content>
		</>
	);
}
