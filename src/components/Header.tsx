"use client";

import React from "react";

// components
import { Flex, Text } from "@radix-ui/themes";

// types
import type { Button } from "@radix-ui/themes";

type HeaderButton = {
	isShown?: boolean;
	button: React.ReactElement<React.ComponentProps<typeof Button>>;
};

type HeaderProps = {
	title: string;
	description: string;
	buttons?: Array<HeaderButton>;
};

const Header = ({ title, description, buttons = [] }: HeaderProps) => {
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
				<Text size="6" weight="bold">
					{title}
				</Text>
				{/* description */}
				<Text color="gray">{description}</Text>
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
