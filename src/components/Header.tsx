"use client";

import React from "react";

// context
import { useToast } from "@/context/ToastContext";

// components
import { Flex, Text, IconButton } from "@radix-ui/themes";
import { CopyIcon } from "@radix-ui/react-icons";

// types
import type { Button } from "@radix-ui/themes";

type HeaderButton = {
	isShown?: boolean;
	button: React.ReactElement<React.ComponentProps<typeof Button>>;
};

type HeaderProps = {
	title: string;
	description: string;
	titleCopy?: boolean;
	descriptionCopy?: boolean;
	buttons?: Array<HeaderButton>;
};

const Header = ({ title, description, titleCopy, descriptionCopy, buttons = [] }: HeaderProps) => {
	const toast = useToast();

	const handleCopy = async (event: React.MouseEvent, text: string) => {
		try {
			event.preventDefault();
			event.stopPropagation();

			await navigator.clipboard.writeText(text);
			toast.show("success", `${text} copied to clipboard.`);
		} catch (error) {
			console.error(error);
			toast.show("error", `Failed to copy ${text}.`);
		}
	};

	return (
		<Flex
			width="100%"
			direction={{ initial: "column", sm: "row" }}
			align={{ initial: "start", sm: "center" }}
			justify="between"
			wrap="wrap"
			gap="4"
			className="select-none"
		>
			{/* details */}
			<Flex direction="column" gap="1" className="flex-1">
				{/* title */}
				<Flex align="center" gap="2">
					<Text size="6" weight="bold">
						{title}
					</Text>
					{titleCopy && (
						<IconButton
							type="button"
							size="1"
							variant="ghost"
							color="gray"
							className="!cursor-pointer"
							onClick={(event) => handleCopy(event, title)}
						>
							<CopyIcon width="14" height="14" />
						</IconButton>
					)}
				</Flex>
				{/* description */}
				<Flex align="center" gap="2">
					<Text color="gray">{description}</Text>
					{descriptionCopy && (
						<IconButton
							type="button"
							size="1"
							variant="ghost"
							color="gray"
							className="!cursor-pointer"
							onClick={(event) => handleCopy(event, description)}
						>
							<CopyIcon width="14" height="14" />
						</IconButton>
					)}
				</Flex>
			</Flex>

			{/* buttons */}
			{buttons.length > 0 && (
				<Flex gap="2" wrap="wrap">
					{buttons
						.filter((button: HeaderButton) => button.isShown ?? true)
						.map((button, index) => (
							<React.Fragment key={index}>{button.button}</React.Fragment>
						))}
				</Flex>
			)}
		</Flex>
	);
};

export { Header };
