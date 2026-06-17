"use client";

import { Box, Flex } from "@radix-ui/themes";

interface ContentProps {
	children?: React.ReactNode;
}

const Content = ({ children }: ContentProps) => {
	return (
		<Box className="w-full">
			<Flex direction="column" gap="8" py="8" className="max-w-[1200px] mx-auto px-4 md:px-8">
				{children}
			</Flex>
		</Box>
	);
};

Content.displayName = "Content";

export { Content };
