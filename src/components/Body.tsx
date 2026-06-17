"use client";

import React from "react";
import { Box, Flex } from "@radix-ui/themes";

// types
type BodyProps = {
	centered?: boolean;
	children: React.ReactNode;
};

const Body = ({ centered = false, children }: BodyProps) => {
	return (
		<Box width="100%" className="min-h-screen">
			<Flex
				width="100%"
				maxWidth="1200px"
				direction="column"
				align={centered ? "center" : "start"}
				justify={centered ? "center" : "start"}
				p="4"
				gap="6"
				className={`mx-auto ${centered ? "min-h-screen" : "min-h-[calc(100vh-2rem)]"}`}
			>
				{children}
			</Flex>
		</Box>
	);
};

export default Body;
