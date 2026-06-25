"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { Cross1Icon, Pencil1Icon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";

// actions
import { updateProduct } from "../../actions";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
	const args = use(params);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Products", url: "/dashboard/products" },
					{ label: "Edit product", url: `/dashboard/products/${args.id}/edit` },
				]}
			/>

			{/* header */}
			<Header title="Edit product" description="Modify the name, barcode, and price details to update this product in your catalog." />

			{/* form */}
			<React.Suspense>
				<Form id={args.id} />
			</React.Suspense>
		</>
	);
}

// local components
interface FormProps {
	id: string;
}

function Form({ id }: FormProps) {
	const router = useRouter();
	const params = useSearchParams();
	const toast = useToast();

	const [name, setName] = useState<string>("");
	const [barcode, setBarcode] = useState<string>("");
	const [price, setPrice] = useState<string>("");

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<{ name?: string; barcode?: string; price?: string }>({});

	useEffect(() => {
		setName(params.get("name") ?? "");
		setBarcode(params.get("barcode") ?? "");
		setPrice(params.get("price") ?? "");
	}, [params]);

	const handleEdit = async (event: React.FormEvent) => {
		event.preventDefault();

		const productId = parseInt(id);
		if (isNaN(productId)) return void toast.show("error", "Invalid product ID.");

		const newErrors: typeof errors = {};
		if (!name.trim()) newErrors.name = "Name is required.";
		if (!barcode.trim()) newErrors.barcode = "Barcode is required.";
		if (!price.trim()) newErrors.price = "Price is required.";

		if (Object.keys(newErrors).length > 0) return void setErrors(newErrors);

		const parsedPrice = Math.round(parseFloat(price) * 100) / 100;
		if (isNaN(parsedPrice) || parsedPrice <= 0) return void setErrors((previous) => ({ ...previous, price: "Please enter a valid price." }));

		try {
			setIsLoading(true);

			// call action
			const response = await updateProduct(productId, name.trim(), barcode.trim(), parsedPrice);

			if (response.success) {
				toast.show("success", "Product updated successfully.");
				router.refresh();

				setTimeout(() => router.replace("/dashboard/products"), 100);
			} else toast.show("error", response.message || "Failed to update product.");
		} catch (error) {
			console.error(error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Flex asChild width="100%" direction="column" gap="4">
			<form noValidate onSubmit={handleEdit}>
				{/* fields */}
				<Flex direction="column" gap="2">
					{/* name field */}
					<Flex width="100%" direction="column" gap="1" className="select-none">
						<Text as="label" htmlFor="name" size="2" weight="bold">
							Name <Text color="red">*</Text>
						</Text>
						<TextField.Root
							autoFocus
							variant={errors.name ? "soft" : undefined}
							id="name"
							name="name"
							type="text"
							placeholder="e.g. Wireless Mouse"
							disabled={isLoading}
							value={name}
							color={errors.name ? "red" : undefined}
							onChange={(event) => {
								setName(event.target.value);
								if (errors.name) setErrors((previous) => ({ ...previous, name: undefined }));
							}}
						/>
						{errors.name && (
							<Text size="1" color="red" weight="medium">
								{errors.name}
							</Text>
						)}
					</Flex>

					{/* barcode field */}
					<Flex width="100%" direction="column" gap="1" className="select-none">
						<Text as="label" htmlFor="barcode" size="2" weight="bold">
							Barcode <Text color="red">*</Text>
						</Text>
						<TextField.Root
							variant={errors.barcode ? "soft" : undefined}
							id="barcode"
							name="barcode"
							type="text"
							placeholder="e.g. 5201234567890"
							disabled={isLoading}
							value={barcode}
							color={errors.barcode ? "red" : undefined}
							onChange={(event) => {
								setBarcode(event.target.value);
								if (errors.barcode) setErrors((previous) => ({ ...previous, barcode: undefined }));
							}}
						/>
						{errors.barcode && (
							<Text size="1" color="red" weight="medium">
								{errors.barcode}
							</Text>
						)}
					</Flex>

					{/* price field */}
					<Flex width="100%" direction="column" gap="1" className="select-none">
						<Text as="label" htmlFor="price" size="2" weight="bold">
							Price <Text color="red">*</Text>
						</Text>
						<TextField.Root
							variant={errors.price ? "soft" : undefined}
							id="price"
							name="price"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							disabled={isLoading}
							value={price}
							color={errors.price ? "red" : undefined}
							onChange={(event) => {
								setPrice(event.target.value);
								if (errors.price) setErrors((previous) => ({ ...previous, price: undefined }));
							}}
						>
							<TextField.Slot side="right">
								<Text>€</Text>
							</TextField.Slot>
						</TextField.Root>
						{errors.price && (
							<Text size="1" color="red" weight="medium">
								{errors.price}
							</Text>
						)}
					</Flex>
				</Flex>

				{/* buttons */}
				<Flex width="100%" justify="end" gap="2">
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
						<Pencil1Icon width="12" height="12" />
						Save
					</Button>
				</Flex>
			</form>
		</Flex>
	);
}
