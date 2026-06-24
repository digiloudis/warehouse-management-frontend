"use client";

import React from "react";

// components
import { Flex, IconButton, Text, Strong } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

type PaginationProps = {
	page: number;
	pages: number;
	onPageChange: (newPage: number | ((prev: number) => number)) => void;
};

const Pagination = ({ page, pages, onPageChange }: PaginationProps) => {
	if (pages <= 1) return null;

	return (
		<Flex width="100%" align="center" justify="center" gap="4" className="select-none">
			{/* previous button */}
			<IconButton
				variant="soft"
				color="gray"
				size="1"
				className="!cursor-pointer"
				disabled={page === 1}
				onClick={() => onPageChange((previous: number) => Math.max(1, previous - 1))}
			>
				<ChevronLeftIcon width="16" height="16" />
			</IconButton>

			{/* page */}
			<Text size="2" weight="medium" color="gray">
				Page <Strong className="text-[var(--gray-12)]">{page}</Strong> of {pages}
			</Text>

			{/* next button */}
			<IconButton
				variant="soft"
				color="gray"
				size="1"
				className="!cursor-pointer"
				disabled={page === pages}
				onClick={() => onPageChange((previous: number) => Math.min(pages, previous + 1))}
			>
				<ChevronRightIcon width="16" height="16" />
			</IconButton>
		</Flex>
	);
};

export { Pagination };
