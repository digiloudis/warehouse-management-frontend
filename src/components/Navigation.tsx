// components/SimpleNavbar.tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";

// components
import { Flex, IconButton, Tooltip } from "@radix-ui/themes";
import { ExitIcon } from "@radix-ui/react-icons";

import Label from "./Label";

// actions
import { logout } from "@/app/auth/login/actions";

export const Navigation = () => {
	const [isTransitioning, startTransition] = useTransition();

	const handleLogoutButtonClick = () => startTransition(async () => await logout());

	return (
		<Flex
			width="100%"
			justify="center"
			position="sticky"
			style={{
				top: 0,
				zIndex: 99,
				borderBottom: "1px solid var(--gray-5)",
				backgroundColor: "var(--color-background)",
			}}
		>
			<Flex width="100%" maxWidth="1200px" direction="row" align="center" justify="between" px="4" py="3" className="mx-auto">
				{/* logo */}
				<Link href="/dashboard">
					<Label weight="bold" size="4" className="cursor-pointer">
						WarehouseApp
					</Label>
				</Link>

				{/* logout button */}
				<Flex direction="row" align="center">
					<Tooltip content="Logout">
						<IconButton variant="soft" color="red" className="!cursor-pointer" onClick={handleLogoutButtonClick} disabled={isTransitioning}>
							<ExitIcon />
						</IconButton>
					</Tooltip>
				</Flex>
			</Flex>
		</Flex>
	);
};
