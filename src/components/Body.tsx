"use client";

import React from "react";
import { Flex } from "@radix-ui/themes";

// types
type BodyProps = {
	centered?: boolean;
	short?: boolean;
	children: React.ReactNode;
};

const Body = ({ centered = false, short = false, children }: BodyProps) => {
	return (
		<Flex
			width="100%"
			maxWidth={short ? "400px" : "1200px"}
			direction="column"
			align={centered ? "center" : "start"}
			justify={centered ? "center" : "start"}
			px="4"
			py="6"
			gap="6"
			className="mx-auto min-h-screen"
			style={{ minHeight: centered ? "100vh" : "50vh" }}
		>
			{children}
		</Flex>
	);
};

export default Body;
