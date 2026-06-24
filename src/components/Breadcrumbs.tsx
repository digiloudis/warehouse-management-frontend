"use client";

import Link from "next/link";

// components
import { Flex, Text } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";

// types
type BreadcrumbItem = {
	label: string;
	url?: string;
};

type BreadcrumbsProps = {
	items: Array<BreadcrumbItem>;
};

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
	return (
		<Flex asChild align="center" gap="2">
			<nav>
				<Flex align="center" wrap="wrap" gap="2">
					{items.map((item, index) => {
						const isLast = index === items.length - 1;

						return (
							<Flex key={index} align="center" gap="2">
								{isLast || !item.url ? (
									/* last link */
									<Text size="2" weight="medium" className="select-none text-[var(--gray-12)]">
										{item.label}
									</Text>
								) : (
									/* default link */
									<Text size="2" weight="medium" className="cursor-pointer select-none text-[var(--gray-10)] hover:text-[var(--gray-12)]">
										<Link href={item.url}>{item.label}</Link>
									</Text>
								)}

								{/* chevron */}
								{!isLast && <ChevronRightIcon width="12" height="12" className="text-[var(--gray-8)]" />}
							</Flex>
						);
					})}
				</Flex>
			</nav>
		</Flex>
	);
};

export { Breadcrumbs };
