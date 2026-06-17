"use client";

import Link from "next/link";
import { Box, Heading, Text, Flex } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";

interface CardProps {
	title: string;
	description: string;
	href: string;
	icon?: React.ReactNode;
}

export const Card = ({ title, description, href, icon }: CardProps) => {
	return (
		<Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
			<Box
				className="
                    group relative p-6 bg-white border border-[var(--gray-5)] 
                    rounded-[var(--radius-4)] shadow-sm transition-all duration-200
                    hover:border-[var(--blue-8)] hover:shadow-md active:scale-[0.98]
                    cursor-pointer overflow-hidden
                "
			>
				<Flex justify="between" align="start">
					<Flex direction="column" gap="2">
						{/* Icon αν υπάρχει */}
						{icon && <Box className="text-[var(--gray-10)] group-hover:text-[var(--blue-9)] transition-colors mb-2">{icon}</Box>}

						<Heading size="4" weight="bold" className="group-hover:text-[var(--blue-9)] transition-colors">
							{title}
						</Heading>

						<Text size="2" color="gray">
							{description}
						</Text>
					</Flex>

					{/* Διακριτικό βέλος που εμφανίζεται πιο έντονα στο hover */}
					<Box className="text-[var(--gray-6)] group-hover:text-[var(--blue-9)] transition-transform group-hover:translate-x-1 duration-200">
						<ChevronRightIcon width="24" height="24" />
					</Box>
				</Flex>
			</Box>
		</Link>
	);
};
