"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";

// actions
import { createWarehouse } from "../actions";

export default function Page() {
	return (
		<>
			{/* location */}
			<Breadcrumbs
				items={[
					{ label: "Dashboard", url: "/dashboard" },
					{ label: "Warehouses", url: "/dashboard/warehouses" },
					{ label: "Create warehouse", url: "/dashboard/warehouses/create" },
				]}
			/>

			{/* header */}
			<Header title="Create warehouse" description="Fill in the name and location details to add a new storage hub to your network." />

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
	const toast = useToast();

	const [name, setName] = useState<string>("");
	const [location, setLocation] = useState<string>("");

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<{ name?: string; location?: string }>({});

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();

		const newErrors: typeof errors = {};
		if (!name.trim()) newErrors.name = "Name is required.";
		if (!location.trim()) newErrors.location = "Location is required.";

		if (Object.keys(newErrors).length > 0) return void setErrors(newErrors);

		try {
			setIsLoading(true);
			const response = await createWarehouse(name.trim(), location.trim());

			if (response.success) {
				toast.show("success", "Warehouse created successfully.");
				router.refresh();

				setTimeout(() => router.replace("/dashboard/warehouses"), 100);
			} else {
				toast.show("error", response.message || "Failed to create warehouse.");
			}
		} catch (error) {
			console.error(error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Flex asChild width="100%" direction="column" gap="4">
			<form noValidate onSubmit={handleCreate}>
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
							placeholder="e.g. Central Athens Hub"
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

					{/* location field */}
					<Flex width="100%" direction="column" gap="1" className="select-none">
						<Text as="label" htmlFor="location" size="2" weight="bold">
							Location <Text color="red">*</Text>
						</Text>
						<TextField.Root
							variant={errors.location ? "soft" : undefined}
							id="location"
							name="location"
							type="text"
							placeholder="e.g. Peristeri, Greece"
							disabled={isLoading}
							value={location}
							color={errors.location ? "red" : undefined}
							onChange={(event) => {
								setLocation(event.target.value);
								if (errors.location) setErrors((previous) => ({ ...previous, location: undefined }));
							}}
						/>
						{errors.location && (
							<Text size="1" color="red" weight="medium">
								{errors.location}
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
						onClick={() => router.push("/dashboard/warehouses")}
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
