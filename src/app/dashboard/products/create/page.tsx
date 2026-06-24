"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";

import Breadcrumbs from "@/components/Breadcrumbs";

// actions
import { createProduct } from "../actions";
import { Header } from "@/components/Header";

export default function Page() {
	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Products", url: "/dashboard/products" },
					{ label: "Create product", url: "/dashboard/products/create" },
				]}
			/>

			{/* header */}
			<Header title="Create product" description="Add a new item to your inventory. Fill in the general information, pricing, and stock details." />

			{/* form */}
			<React.Suspense>
				<Form />
			</React.Suspense>
		</>
	);
}

// local components
function Form() {
	const router = useRouter();
	const params = useSearchParams();
	const toast = useToast();

	const [name, setName] = useState<string>("");
	const [barcode, setBarcode] = useState<string>("");
	const [price, setPrice] = useState<string>("");

	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		const paramName = params.get("name");
		const paramBarcode = params.get("barcode");
		const paramPrice = params.get("price");

		if (paramName) setName(paramName);
		if (paramBarcode) setBarcode(paramBarcode);
		if (paramPrice) setPrice(paramPrice);
	}, [params]);

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!name.trim() || !barcode.trim() || !price.trim()) {
			toast.show("error", "Please fill in all fields.");
			return;
		}

		// 💡 Float precision fix (στρογγυλοποίηση)
		const parsedPrice = Math.round(parseFloat(price) * 100) / 100;
		if (isNaN(parsedPrice) || parsedPrice <= 0) {
			toast.show("error", "Please enter a valid price.");
			return;
		}

		try {
			setIsLoading(true);
			const response = await createProduct(name.trim(), barcode.trim(), parsedPrice);

			if (response.success) {
				toast.show("success", "Product created successfully.");
				router.refresh();
				router.push("/dashboard/products");
			} else {
				toast.show("error", response.message || "Failed to create product.");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Flex asChild width="100%" direction="column" align="stretch" gap="4">
			<form onSubmit={handleCreate}>
				<Flex direction="column" gap="2" width="100%">
					{/* name field */}
					<Flex direction="column" align="stretch" gap="1" width="100%">
						<Text as="label" htmlFor="name" size="2" weight="bold" className="select-none text-[var(--gray-11)]">
							Name
						</Text>
						<TextField.Root
							autoFocus // 💡 Καθαρό autofocus στο mount
							required
							placeholder="Product name"
							name="name"
							id="name"
							type="text"
							autoCapitalize="false"
							autoCorrect="false"
							spellCheck="false"
							disabled={isLoading}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</Flex>

					{/* barcode field */}
					<Flex direction="column" align="stretch" gap="1" width="100%">
						<Text as="label" htmlFor="barcode" size="2" weight="bold" className="select-none text-[var(--gray-11)]">
							Barcode
						</Text>
						<TextField.Root
							required
							placeholder="BAR-0001"
							name="barcode"
							id="barcode"
							type="text"
							autoCapitalize="false"
							autoCorrect="false"
							spellCheck="false"
							disabled={isLoading}
							value={barcode}
							onChange={(event) => setBarcode(event.target.value)}
						/>
					</Flex>

					{/* price field */}
					<Flex direction="column" align="stretch" gap="1" width="100%">
						<Text as="label" htmlFor="price" size="2" weight="bold" className="select-none text-[var(--gray-11)]">
							Price
						</Text>
						<TextField.Root
							required
							name="price"
							id="price"
							type="number"
							autoCapitalize="false"
							autoCorrect="false"
							spellCheck="false"
							step="0.01"
							min="0.01"
							disabled={isLoading}
							value={price}
							onChange={(event) => setPrice(event.target.value)}
						>
							<TextField.Slot>&euro;</TextField.Slot>
						</TextField.Root>
					</Flex>
				</Flex>

				{/* buttons */}
				<Flex width="100%" justify="end" gap="2" mt="4">
					<Button
						variant="soft"
						size="2"
						color="gray"
						type="button"
						disabled={isLoading}
						className="!cursor-pointer"
						onClick={() => router.push("/dashboard/products")}
					>
						<Cross1Icon width="12" height="12" />
						Cancel
					</Button>
					<Button size="2" type="submit" disabled={isLoading} loading={isLoading} className="!cursor-pointer">
						<PlusIcon width="12" height="12" />
						Create
					</Button>
				</Flex>
			</form>
		</Flex>
	);
}
