"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

// components
import { Box, DropdownMenu, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { ExitIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";

// actions
import { logout } from "@/app/auth/login/actions";

// types
type NavigationLink = { label: string; url: string };

// data
const links: Array<NavigationLink> = [
	{ label: "Warehouses", url: "/dashboard/warehouses" },
	{ label: "Products", url: "/dashboard/products" },
	{ label: "Transactions", url: "/dashboard/transactions" },
];

const Navigation = () => {
	const pathname = usePathname();
	const router = useRouter();

	// handle logout
	const [isTransitioning, startTransition] = useTransition();
	const handleLogoutButtonClick = () => startTransition(async () => await logout());

	return (
		<Flex width="100%" justify="center" position="sticky" className="z-99 border-b border-solid border-[var(--gray-6)] bg-[var(--color-background)]">
			<Flex width="100%" maxWidth="1200px" direction="row" align="center" justify="between" p="4">
				{/* logo */}
				<Text weight="bold" size="4" className="select-none !cursor-pointer" onClick={() => router.push("/dashboard")}>
					WarehouseApp
				</Text>

				{/* desktop tabs */}
				<Flex align="center" gap="2" display={{ initial: "none", md: "flex" }}>
					{links.map((link) => {
						const isActive: boolean = pathname.startsWith(link.url);

						return (
							<Flex
								key={link.url}
								px="4"
								py="1"
								onClick={() => router.push(link.url)}
								className={`!cursor-pointer ${isActive ? "bg-[var(--amber-3)]" : "hover:bg-[var(--gray-3)]"} rounded-[var(--radius-2)]`}
							>
								<Text size="2" color={isActive ? "amber" : "gray"} weight="medium" className="select-none">
									{link.label}
								</Text>
							</Flex>
						);
					})}
				</Flex>

				<Flex direction="row" align="center" gap="2">
					{/* desktop actions */}
					<Box display={{ initial: "none", md: "block" }}>
						<Tooltip content="Logout">
							<IconButton variant="soft" color="red" className="!cursor-pointer" onClick={handleLogoutButtonClick} disabled={isTransitioning}>
								<ExitIcon />
							</IconButton>
						</Tooltip>
					</Box>

					{/* mobile links */}
					<Flex display={{ initial: "flex", md: "none" }} align="center">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<IconButton variant="ghost" color="gray" size="2" className="!cursor-pointer">
									<HamburgerMenuIcon width="16" height="16" />
								</IconButton>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="end" size="2" className="w-[180px]">
								{links.map((link) => {
									const isActive = pathname.startsWith(link.url);

									return (
										<DropdownMenu.Item
											key={link.url}
											color={isActive ? "amber" : "gray"}
											className="!cursor-pointer"
											onClick={() => router.push(link.url)}
										>
											<Text size="2" weight={isActive ? "bold" : "medium"}>
												{link.label}
											</Text>
										</DropdownMenu.Item>
									);
								})}

								<DropdownMenu.Separator />

								<DropdownMenu.Item color="red" onClick={handleLogoutButtonClick} disabled={isTransitioning} className="!cursor-pointer">
									<Flex align="center" gap="2" width="100%">
										<ExitIcon />
										<Text size="2" weight="medium">
											{isTransitioning ? "Logging out..." : "Logout"}
										</Text>
									</Flex>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
};

Navigation.displayName = "Navigation";
export { Navigation };
