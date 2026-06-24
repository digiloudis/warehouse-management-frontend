"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// components
import { Box, DropdownMenu, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { ExitIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";

// actions
import { logout } from "@/app/auth/login/actions";

// types
type NavigationLink = { label: string; url: string; locked: boolean };

// data
const links: Array<NavigationLink> = [
	{ label: "Warehouses", url: "/dashboard/warehouses", locked: false },
	{ label: "Products", url: "/dashboard/products", locked: false },
	{ label: "Transactions", url: "/dashboard/transactions", locked: false },
	{ label: "Users", url: "/dashboard/users", locked: true },
];

const Navigation = () => {
	const pathname = usePathname();

	// handle logout
	const [isTransitioning, startTransition] = useTransition();
	const handleLogoutButtonClick = () => startTransition(async () => await logout());

	return (
		<Flex width="100%" justify="center" position="sticky" className="z-99 border-b border-solid border-[var(--gray-6)] bg-[var(--color-background)]">
			<Flex width="100%" maxWidth="1200px" direction="row" align="center" justify="between" p="4">
				{/* logo */}
				<Text weight="bold" size="4" className="select-none !cursor-pointer">
					<Link href="/dashboard">WarehouseApp</Link>
				</Text>

				{/* desktop tabs */}
				<Flex align="center" gap="2" display={{ initial: "none", md: "flex" }}>
					{links.map((link) => {
						const isActive: boolean = pathname.startsWith(link.url);
						const isLocked: boolean = link.locked;

						// container properties
						const cursor: string = isLocked ? "!cursor-not-allowed" : "!cursor-pointer";
						const opacity: string = isLocked ? "opacity-50" : "";
						const backgroundColor: string = isActive ? "bg-[var(--amber-3)]" : "";
						const hoverBackgroundColor: string = isActive || isLocked ? "" : "hover:bg-[var(--gray-3)]";

						// text properties
						const textColor: string = isLocked ? "text-[var(--gray-8)]" : isActive ? "text-[var(--amber-11)]" : "text-[var(--gray-11)]";

						const Tab = () => (
							<Flex
								key={link.url}
								px="4"
								py="1"
								className={`!${cursor} ${opacity} ${backgroundColor} ${hoverBackgroundColor} rounded-[var(--radius-2)]`}
							>
								<Text size="2" weight="medium" className={`select-none ${textColor}`}>
									{link.label}
								</Text>
							</Flex>
						);

						if (link.locked) return <Tab key={link.url} />;
						else
							return (
								<Link prefetch={false} href={link.url} key={link.url}>
									<Tab />
								</Link>
							);
					})}
				</Flex>

				<Flex direction="row" align="center" gap="2">
					{/* desktop actions */}
					<Box display={{ initial: "none", md: "block" }}>
						<Tooltip content="Logout">
							<IconButton
								variant="soft"
								color="red"
								className="!cursor-pointer"
								onClick={() => startTransition(async () => await logout())}
								disabled={isTransitioning}
							>
								<ExitIcon />
							</IconButton>
						</Tooltip>
					</Box>

					{/* mobile links */}
					<Flex display={{ initial: "flex", md: "none" }} align="center">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<IconButton variant="ghost" color="gray" size="2" className="!cursor-pointer inline-flex items-center justify-center">
									<HamburgerMenuIcon width="16" height="16" />
								</IconButton>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="end" size="2" className="w-[180px]">
								{links.map((link) => {
									const isActive = pathname.startsWith(link.url);

									return (
										<DropdownMenu.Item key={link.url} disabled={link.locked} asChild={!link.locked}>
											{link.locked ? (
												<span className="w-full block py-2 text-sm font-medium opacity-35 cursor-not-allowed select-none">
													{link.label}
												</span>
											) : (
												<Link
													href={link.url}
													className={`w-full block px-3 py-2 text-sm font-medium no-underline transition-colors rounded-[var(--radius-small)] ${
														isActive ? "text-[var(--amber-11)] font-semibold bg-[var(--amber-3)]" : "text-[var(--gray-11)]"
													}`}
												>
													{link.label}
												</Link>
											)}
										</DropdownMenu.Item>
									);
								})}

								<DropdownMenu.Separator />
								<DropdownMenu.Item
									color="red"
									onClick={handleLogoutButtonClick}
									disabled={isTransitioning}
									className="!cursor-pointer px-3 py-2 font-medium"
								>
									<Flex align="center" gap="2" width="100%">
										<ExitIcon />
										{isTransitioning ? "Logging out..." : "Logout"}
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
