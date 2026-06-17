"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// radix primitives
import { Box, Flex, Card, TextField } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

// components
import { Navigation } from "@/components/Navigation";
import { Content } from "@/components/Content";
import Label from "@/components/Label";
import Button from "@/components/Button";

// actions
import { createProduct } from "./actions";

export default function CreateProductPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [barcode, setBarcode] = useState("");
	const [price, setPrice] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !barcode || !price) {
			setError("All fields are required.");
			return;
		}

		setSubmitting(true);
		setError(null);

		const result = await createProduct({
			name,
			barcode,
			price: parseFloat(price),
		});

		if (result.success) {
			router.push("/dashboard/products"); // Ή όπου έχεις τη λίστα προϊόντων
			router.refresh();
		} else {
			setError(result.error || "Failed to create product.");
			setSubmitting(false);
		}
	};

	return (
		<>
			<Navigation />
			<Content>
				{/* Back Button */}
				<Box mb="4">
					<Link
						href="/dashboard/products"
						className="inline-flex items-center gap-2 text-[var(--gray-10)] hover:text-[var(--slate-12)] transition-colors text-sm font-medium"
					>
						<ArrowLeftIcon /> Back to Products
					</Link>
				</Box>

				{/* Header */}
				<Flex direction="column" gap="1" mb="5">
					<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
						Create Product
					</Label>
					<Label size="3" className="text-[var(--gray-10)]">
						Add a new product item to your global catalog.
					</Label>
				</Flex>

				{/* Form Container */}
				<Card size="3" variant="surface" className="max-w-[500px]">
					<form onSubmit={handleSubmit}>
						<Flex direction="column" gap="4">
							{/* Name Input */}
							<Flex direction="column" gap="1">
								<Label size="2" weight="bold" className="text-[var(--slate-12)]">
									Product Name
								</Label>
								<TextField.Root
									placeholder="e.g. Wireless Mouse"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={submitting}
								/>
							</Flex>

							{/* Barcode Input */}
							<Flex direction="column" gap="1">
								<Label size="2" weight="bold" className="text-[var(--slate-12)]">
									Barcode
								</Label>
								<TextField.Root
									placeholder="e.g. 501234567890"
									value={barcode}
									onChange={(e) => setBarcode(e.target.value)}
									disabled={submitting}
								/>
							</Flex>

							{/* Price Input */}
							<Flex direction="column" gap="1">
								<Label size="2" weight="bold" className="text-[var(--slate-12)]">
									Price (€)
								</Label>
								<TextField.Root
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									disabled={submitting}
								/>
							</Flex>

							{/* Error Message */}
							{error && (
								<Label size="2" color="red" weight="medium">
									{error}
								</Label>
							)}

							{/* Submit Buttons */}
							<Flex gap="3" justify="end" mt="2">
								<Button type="button" disabled={submitting} onClick={() => router.push("/dashboard/products")} className="cursor-pointer">
									Cancel
								</Button>
								<Button type="submit" disabled={submitting} className="cursor-pointer">
									{submitting ? "Creating..." : "Save Product"}
								</Button>
							</Flex>
						</Flex>
					</form>
				</Card>
			</Content>
		</>
	);
}
