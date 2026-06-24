"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

// contexts
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text, TextField, Dialog, Code } from "@radix-ui/themes";
import { Pencil1Icon, ArchiveIcon, PlusIcon } from "@radix-ui/react-icons";
import Breadcrumbs from "@/components/Breadcrumbs";

// actions
import { getRole } from "../../actions";
import { archiveProduct, getProduct } from "../actions";

// types
import type { UserRole } from "../../actions";
import type { Product } from "../actions";

type InventoryItem = {
	inventoryId: number;
	productId: number;
	productName: string;
	warehouseId: number;
	warehouseName: string;
	quantity: number;
};

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
	const args = use(params);
	const toast = useToast();
	const router = useRouter();

	const [role, setRole] = useState<UserRole | null>(null);
	const [product, setProduct] = useState<Product | null>(null);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

	const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState<boolean>(false);
	const [archiveConfirmation, setArchiveConfirmation] = useState<string>("");

	// get role & product
	useEffect(() => {
		setIsLoading(true);

		Promise.all([getRole(), getProduct(parseInt(args.id))])
			.then(([roleResponse, productResponse]) => {
				setRole(roleResponse);

				if (!productResponse.success) {
					toast.show("error", productResponse.message);
					setProduct(null);
				} else setProduct(productResponse.data);
			})
			.catch((error) => {
				console.error(error);
				toast.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));
	}, [args.id]);

	const isAdmin: boolean = role === 1;
	const isManager: boolean = role === 2;

	// archive confirmation
	async function handleArchive() {
		if (!product || !product.id) throw new Error();
		if (archiveConfirmation.toLowerCase() !== "archive") return;

		try {
			setIsActionLoading(true);

			const response = await archiveProduct(product.id);
			if (response.success) {
				toast.show("success", "Product archived.");
				setIsArchiveDialogOpen(false);

				router.push("/dashboard/products");
			} else toast.show("error", response.message || "failed to archive product");
		} catch (error) {
			console.log(error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsActionLoading(false);
		}
	}

	if (isLoading)
		return (
			<Text size="2" className="select-none text-[var(--gray-10)]">
				Loading product...
			</Text>
		);

	if (!product)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Products", url: "/dashboard/products" },
						{ label: "Unknown product", url: `/dashboard/products/` },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Product not found.
				</Text>
			</>
		);

	if (product?.isArchived)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Products", url: "/dashboard/products" },
						{ label: product.name, url: `/dashboard/products/${product.id}` },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Product is archived.
				</Text>
			</>
		);

	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Products", url: "/dashboard/products" },
					{ label: product.name, url: `/dashboard/products/${product.id}` },
				]}
			/>

			{/* header */}
			<Flex width="100%" direction={{ initial: "column", sm: "row" }} align={{ initial: "start", sm: "center" }} justify="between" wrap="wrap" gap="4">
				<Flex direction="column" gap="1" className="flex-1">
					<Text size="6" weight="bold" className="select-none">
						{product.name}
					</Text>
					<Text size="3" className="select-none text-[var(--gray-10)]">
						{product.barcode}
					</Text>
				</Flex>

				{/* actions */}
				{(isAdmin || isManager) && (
					<Flex gap="2" wrap="wrap">
						{/* edit button & dialog */}
						<Button variant="soft" color="gray" size="2" className="!cursor-pointer" onClick={() => {}}>
							<Pencil1Icon width="16" height="16" />
							Edit
						</Button>

						{/* archive button & dialog */}
						<Dialog.Root
							open={isArchiveDialogOpen}
							onOpenChange={(open) => {
								setIsArchiveDialogOpen(open);
								if (!open) setArchiveConfirmation("");
							}}
						>
							<Dialog.Trigger>
								<Button color="red" size="2" className="!cursor-pointer" disabled={!product?.id}>
									<ArchiveIcon width="16" height="16" />
									Archive
								</Button>
							</Dialog.Trigger>

							<Dialog.Content size="2" maxWidth="400px">
								<Dialog.Title className="select-none">Archive product</Dialog.Title>
								<Dialog.Description size="2" mb="2" className="select-none">
									This action will archive <strong>{product?.name}</strong>. To confirm, please type{" "}
									<Code color="red" weight="bold">
										archive
									</Code>{" "}
									below.
								</Dialog.Description>

								<Flex direction="column" gap="3">
									<label>
										<TextField.Root
											placeholder='Type "archive" to confirm'
											value={archiveConfirmation}
											onChange={(e) => setArchiveConfirmation(e.target.value)}
											disabled={isActionLoading}
											autoComplete="off"
										/>
									</label>
								</Flex>

								<Flex justify="end" gap="2" mt="4">
									<Dialog.Close>
										<Button variant="soft" color="gray" className="!cursor-pointer" disabled={isActionLoading}>
											Cancel
										</Button>
									</Dialog.Close>
									<Button
										color="red"
										className="!cursor-pointer"
										disabled={archiveConfirmation.toLowerCase() !== "archive" || isActionLoading}
										loading={isActionLoading}
										onClick={handleArchive}
									>
										<ArchiveIcon width="12" height="12" />
										Archive
									</Button>
								</Flex>
							</Dialog.Content>
						</Dialog.Root>
					</Flex>
				)}
			</Flex>
		</>
	);
}
