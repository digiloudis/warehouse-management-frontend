"use client";

import React from "react";

// components
import { Flex, TextField, Select } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type SearchbarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;

	sortMode: string;
	onSortChange: (value: string) => void;
	sortOptions: Record<string, string>;
	sortSeparators?: Array<string>;
};

const Searchbar = ({ search, onSearchChange, searchPlaceholder = "Search...", sortMode, onSortChange, sortOptions, sortSeparators = [] }: SearchbarProps) => {
	return (
		<Flex width="100%" gap="2">
			{/* search bar */}
			<TextField.Root
				required
				autoFocus
				name="search"
				id="search"
				type="search"
				placeholder={searchPlaceholder}
				className="w-full"
				value={search}
				onChange={(event) => onSearchChange(event.target.value)}
			>
				<TextField.Slot side="right">
					<MagnifyingGlassIcon width="16" height="16" />
				</TextField.Slot>
			</TextField.Root>

			{/* sorts */}
			<Select.Root value={sortMode} onValueChange={onSortChange}>
				<Select.Trigger variant="soft" color="gray" className="!cursor-pointer" />

				<Select.Content position="popper" align="end" className="w-max min-w-0">
					{Object.entries(sortOptions).map(([value, label]) => (
						<React.Fragment key={value}>
							<Select.Item className="!cursor-pointer" value={value}>
								{label}
							</Select.Item>
							{sortSeparators.includes(value) && <Select.Separator />}
						</React.Fragment>
					))}
				</Select.Content>
			</Select.Root>
		</Flex>
	);
};

export { Searchbar };
