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
import { getRole } from "../../actions";
import { createWarehouse } from "../actions";

// types
import type { UserRole } from "../../actions";

export default function Page() {
	const router = useRouter();
	const params = useSearchParams();
	const toast = useToast();

	const [role, setRole] = useState<UserRole | null>(null);

	const [name, setName] = useState<string>("");
	const [location, setLocation] = useState<string>("");

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		// get role
		getRole()
			.then((roleResponse) => {
				setRole(roleResponse);
			})
			.catch((error) => {
				console.error(error);
				toast.show("error", "Something went wrong. Please try again later.");
			})
			.finally(() => setIsLoading(false));

		// read search params
		const paramName = params.get("name");
		const paramLocation = params.get("location");

		if (paramName) setName(paramName);
		if (paramLocation) setLocation(paramLocation);
	}, [params]);

	const isAdmin: boolean = role === 1;

	// handle creation
	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!name.trim() || !location.trim()) {
			toast.show("error", "Please fill in all fields.");
			return;
		}

		try {
			setIsActionLoading(true);
			const response = await createWarehouse({ name: name.trim(), location: location.trim() });

			if (response.success) {
				toast.show("success", "Warehouse created successfully.");

				router.refresh();
				router.push("/dashboard/warehouses");
			} else {
				toast.show("error", response.message || "Failed to create warehouse.");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.show("error", "An unexpected error occurred.");
		} finally {
			setIsActionLoading(false);
		}
	};

	if (isLoading)
		return (
			<Text size="2" className="select-none text-[var(--gray-10)]">
				Loading...
			</Text>
		);

	if (!isAdmin)
		return (
			<>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", url: "/dashboard" },
						{ label: "Warehouses", url: "/dashboard/warehouses" },
						{ label: "Create warehouse", url: "/dashboard/warehouses/create" },
					]}
				/>
				<Text size="2" className="select-none text-[var(--gray-10)]">
					Access denied.
				</Text>
			</>
		);

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
			<Flex width="100%" direction={{ initial: "column", sm: "row" }} align={{ initial: "start", sm: "center" }} justify="between" wrap="wrap" gap="4">
				<Flex direction="column" gap="1" className="flex-1">
					<Text size="6" weight="bold" className="select-none">
						Create warehouse
					</Text>
					<Text size="3" className="select-none text-[var(--gray-10)]">
						Add a new storage facility to your inventory network. Fill in the center name and location details.
					</Text>
				</Flex>
			</Flex>

			{/* form */}
			<Flex asChild width="100%" direction="column" align="stretch" gap="4">
				<form onSubmit={handleCreate}>
					{/* fields */}
					<Flex direction="column" gap="2" width="100%">
						{/* name field */}
						<Flex direction="column" align="stretch" gap="1" width="100%">
							<Text as="label" htmlFor="name" size="2" weight="bold" className="select-none text-[var(--gray-11)]">
								Name
							</Text>
							<TextField.Root
								autoFocus={!name}
								required
								placeholder="Warehouse name"
								name="name"
								id="name"
								type="text"
								autoCapitalize="false"
								autoCorrect="false"
								spellCheck="false"
								disabled={isActionLoading}
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
						</Flex>

						{/* location field */}
						<Flex direction="column" align="stretch" gap="1" width="100%">
							<Text as="label" htmlFor="location" size="2" weight="bold" className="select-none text-[var(--gray-11)]">
								Location
							</Text>
							<TextField.Root
								autoFocus={!!name && !location}
								required
								placeholder="Warehouse location"
								name="location"
								id="location"
								type="text"
								autoCapitalize="false"
								autoCorrect="false"
								spellCheck="false"
								disabled={isActionLoading}
								value={location}
								onChange={(event) => setLocation(event.target.value)}
							/>
						</Flex>
					</Flex>

					{/* button */}
					<Flex width="100%" justify="end" gap="2" mt="4">
						<Button
							variant="soft"
							size="2"
							color="gray"
							type="button"
							disabled={isActionLoading}
							className="!cursor-pointer"
							onClick={() => router.push("/dashboard/warehouses")}
						>
							<Cross1Icon width="12" height="12" />
							Cancel
						</Button>
						<Button size="2" type="submit" disabled={isActionLoading} loading={isActionLoading} className="!cursor-pointer">
							<PlusIcon width="12" height="12" />
							Create
						</Button>
					</Flex>
				</form>
			</Flex>
		</>
	);
}
