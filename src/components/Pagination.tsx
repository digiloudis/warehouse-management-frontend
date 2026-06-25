"use client";

import React from "react";

// components
import { Flex, IconButton, Text, Strong, Tooltip } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

// lib
import { formatNumber } from "@/lib/format";

// types
type PaginationProps = {
	page: number;
	pages: number;
	onPageChange: (newPage: number | ((previous: number) => number)) => void;
};

const Pagination = ({ page, pages, onPageChange }: PaginationProps) => {
	if (pages <= 1) return null;

	return (
		<Flex width="fit-content" align="center" gap="2" className="select-none">
			{/* previous button */}
			<Tooltip content="Previous page">
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
			</Tooltip>

			{/* page indicator */}
			<Text size="2" color="gray" weight="medium" className="whitespace-nowrap">
				Page{" "}
				<Tooltip content={page > 999 ? formatNumber(page) : undefined}>
					<Strong className="text-[var(--gray-12)]">{formatNumber(page)}</Strong>
				</Tooltip>
				{" of "}
				<Tooltip content={pages > 999 ? formatNumber(pages) : undefined}>
					<span>{formatNumber(pages)}</span>
				</Tooltip>
			</Text>

			{/* next button */}
			<Tooltip content="Next page">
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
			</Tooltip>
		</Flex>
	);
};

export { Pagination };
