"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// hooks
import { useToast } from "@/context/ToastContext";

// components
import { Card, Avatar, Badge, DropdownMenu, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { CopyIcon, DotsVerticalIcon, ChevronRightIcon } from "@radix-ui/react-icons";

type Color = "amber" | "green" | "red";

export type ListCardOption =
	| {
			type: "item";
			icon?: React.ReactElement;
			label: string;
			color?: "red" | "gray";
			onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
	  }
	| {
			type: "separator";
	  };

type ListCardProps = {
	link?: string;
	icon: React.ReactElement;
	iconColor?: Color;
	title: string;
	titleLink?: string;
	description: string;
	descriptionLink?: string;
	badge?: string;
	badgeColor?: Color;
	date?: Date;
	options?: Array<ListCardOption>;
};

export default function ListCard({
	link,
	icon,
	iconColor = "amber",
	title,
	titleLink,
	description,
	descriptionLink,
	badge,
	badgeColor = "amber",
	date,
	options = [],
}: ListCardProps) {
	const router = useRouter();
	const toast = useToast();

	return (
		<Card
			size="1"
			className={link ? "!cursor-pointer" : ""}
			onClick={() => {
				if (link) router.push(link);
			}}
		>
			<Flex width="100%" align="center" gap="2">
				{/* details */}
				<Avatar size="3" variant="soft" color={iconColor} fallback={icon} />

				<Flex direction="column" align="start" className="min-w-0 flex-1">
					{/* title */}
					{titleLink ? (
						<IconButton
							asChild
							variant="ghost"
							color="gray"
							size="1"
							className="!cursor-pointer -mx-1 px-1 rounded-[var(--radius-1)] hover:bg-[var(--gray-3)] max-w-full justify-start"
						>
							<Link href={titleLink}>
								<Tooltip content={title}>
									<Text weight="bold" size="3" className="select-none truncate">
										{title}
									</Text>
								</Tooltip>
								<Tooltip content="View details">
									<ChevronRightIcon width="16" height="16" className="shrink-0 text-[var(--gray-8)]" />
								</Tooltip>
							</Link>
						</IconButton>
					) : (
						<Flex
							width="fit-content"
							align="center"
							px="1"
							gap="2"
							title={title}
							className="!cursor-pointer -mx-1 rounded-[var(--radius-1)] hover:bg-[var(--gray-3)] max-w-full"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();

								navigator.clipboard.writeText(title);
								toast.show("success", `Copied ${title}.`);
							}}
						>
							<Tooltip content={title}>
								<Text weight="bold" className="select-none truncate">
									{title}
								</Text>
							</Tooltip>
							<Tooltip content="Copy">
								<IconButton size="1" variant="ghost" color="gray">
									<CopyIcon width="14" height="14" className="!cursor-pointer" />
								</IconButton>
							</Tooltip>
						</Flex>
					)}

					{/* description */}
					{descriptionLink ? (
						<IconButton
							asChild
							variant="ghost"
							color="gray"
							size="1"
							className="!cursor-pointer -mx-1 px-1 rounded-[var(--radius-1)] hover:bg-[var(--gray-3)] max-w-full justify-start gap-1"
						>
							<Link href={descriptionLink}>
								<Tooltip content={description}>
									<Text size="2" className="select-none text-[var(--gray-11)] truncate">
										{description}
									</Text>
								</Tooltip>
								<Tooltip content="View details">
									<ChevronRightIcon width="14" height="14" className="shrink-0 text-[var(--gray-8)]" />
								</Tooltip>
							</Link>
						</IconButton>
					) : (
						<Flex
							width="fit-content"
							align="center"
							px="1"
							gap="2"
							className="!cursor-pointer -mx-1 rounded-[var(--radius-1)] hover:bg-[var(--gray-3)] max-w-full"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								navigator.clipboard.writeText(description);
								toast.show("success", `${description} copied.`);
							}}
						>
							<Tooltip content={description}>
								<Text size="2" className="select-none text-[var(--gray-11)] truncate">
									{description}
								</Text>
							</Tooltip>
							<Tooltip content="Copy">
								<IconButton size="1" variant="ghost" color="gray">
									<CopyIcon width="12" height="12" className="!cursor-pointer" />
								</IconButton>
							</Tooltip>
						</Flex>
					)}
				</Flex>

				{/* badge & actions */}
				<Flex align="center" className="ml-auto shrink-0" gap="2">
					<Flex direction="column" align="end" gap="1" className="min-w-0 ">
						{badge && (
							<Badge size="3" color={badgeColor} className="select-none whitespace-nowrap">
								{badge}
							</Badge>
						)}

						{date && (
							<Tooltip content={new Date(date).toLocaleString("en-UK")}>
								<Text size="1" color="gray" className="select-none truncate w-full text-right">
									{new Date(date).toLocaleDateString("en-UK", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Text>
							</Tooltip>
						)}
					</Flex>

					{/* options */}
					{options.length > 0 && (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<IconButton
									variant="ghost"
									color="gray"
									className="!cursor-pointer"
									onPointerDown={(event) => event.stopPropagation()}
									onClick={(event) => event.stopPropagation()}
								>
									<DotsVerticalIcon width="16" height="16" />
								</IconButton>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="end" size="2" className="w-fit">
								{options.map((option, index) => {
									if (option.type === "separator") {
										return <DropdownMenu.Separator key={index} />;
									}

									return (
										<DropdownMenu.Item
											key={index}
											className="!cursor-pointer"
											color={option.color}
											onClick={(event) => {
												event.stopPropagation();
												option.onClick(event);
											}}
										>
											<Flex width="100%" align="center" justify="start" direction="row" gap="4">
												{option.icon}
												<Text size="2">{option.label}</Text>
											</Flex>
										</DropdownMenu.Item>
									);
								})}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					)}
				</Flex>
			</Flex>
		</Card>
	);
}
