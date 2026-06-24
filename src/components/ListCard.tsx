"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// hooks
import { useToast } from "@/context/ToastContext";

// components
import { Card, Avatar, Badge, DropdownMenu, Flex, IconButton, Text, TextField, Tooltip } from "@radix-ui/themes";
import { CopyIcon, DotsVerticalIcon, ChevronRightIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

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
	badgeTooltip?: string; // Προσθήκη του νέου prop
	date?: Date;
	options?: Array<ListCardOption>;
	counterValue?: number;
	onCounterChange?: (value: number) => void;
	maxCounterValue?: number;
	isCounterLimitReached?: boolean;
};

const ListCard = ({
	link,
	icon,
	iconColor = "amber",
	title,
	titleLink,
	description,
	descriptionLink,
	badge,
	badgeColor = "amber",
	badgeTooltip,
	date,
	options = [],
	counterValue,
	onCounterChange,
	maxCounterValue = 1000000,
	isCounterLimitReached = false,
}: ListCardProps) => {
	const router = useRouter();
	const toast = useToast();

	const handleCopy = async (event: React.MouseEvent, text: string) => {
		event.preventDefault();
		event.stopPropagation();
		try {
			await navigator.clipboard.writeText(text);
			toast.show("success", `${text} copied to clipboard.`);
		} catch (error) {
			console.error(error);
			toast.show("error", `Failed to copy ${text}.`);
		}
	};

	const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;

		if (
			target.closest("button") ||
			target.closest("a") ||
			target.closest("[role='menuitem']") ||
			target.closest("[data-radix-popper-content-wrapper]") ||
			target.closest("input")
		) {
			return;
		}

		if (link) {
			router.push(link);
		}
	};

	const renderBadge = () => {
		if (!badge) return null;

		const badgeComponent = (
			<Badge size="3" color={badgeColor} className="select-none whitespace-nowrap">
				{badge}
			</Badge>
		);

		if (badgeTooltip) {
			return <Tooltip content={badgeTooltip}>{badgeComponent}</Tooltip>;
		}

		return badgeComponent;
	};

	const showCounter = counterValue !== undefined && onCounterChange !== undefined;
	const isChosen = showCounter && counterValue > 0;

	return (
		<Card
			size="1"
			className={`${link ? "!cursor-pointer" : ""} transition-colors ${isChosen ? "bg-[var(--accent-2)] border-[var(--accent-6)]" : ""}`}
			onClick={handleCardClick}
		>
			<Flex width="100%" align="center" gap="2">
				{/* details */}
				<Avatar size="3" variant="soft" color={iconColor} fallback={icon} />

				<Flex direction="column" align="start" className="min-w-0 flex-1">
					{/* title */}
					{titleLink ? (
						<Flex width="fit-content" align="center" gap="2">
							<Tooltip content={title}>
								<Text weight="bold" className="select-none truncate">
									{title}
								</Text>
							</Tooltip>
							<Tooltip content="View details">
								<IconButton asChild type="button" size="1" variant="ghost" color="gray" className="!cursor-pointer">
									<Link href={titleLink} onClick={(event) => event.stopPropagation()}>
										<ChevronRightIcon width="16" height="16" />
									</Link>
								</IconButton>
							</Tooltip>
						</Flex>
					) : (
						<Flex width="fit-content" align="center" gap="2">
							<Tooltip content={title}>
								<Text weight="bold" className="select-none truncate">
									{title}
								</Text>
							</Tooltip>
							<Tooltip content="Copy">
								<IconButton
									type="button"
									size="1"
									variant="ghost"
									color="gray"
									className="!cursor-pointer"
									onClick={(event) => handleCopy(event, title)}
								>
									<CopyIcon width="14" height="14" className="pointer-events-none" />
								</IconButton>
							</Tooltip>
						</Flex>
					)}

					{/* description */}
					{descriptionLink ? (
						<Flex width="fit-content" align="center" gap="2">
							<Tooltip content={description}>
								<Text size="2" className="select-none text-[var(--gray-11)] truncate">
									{description}
								</Text>
							</Tooltip>
							<Tooltip content="View details">
								<IconButton asChild type="button" size="1" variant="ghost" color="gray" className="!cursor-pointer">
									<Link href={descriptionLink} onClick={(event) => event.stopPropagation()}>
										<ChevronRightIcon width="14" height="14" />
									</Link>
								</IconButton>
							</Tooltip>
						</Flex>
					) : (
						<Flex width="fit-content" align="center" gap="2">
							<Tooltip content={description}>
								<Text size="2" className="select-none text-[var(--gray-11)] truncate">
									{description}
								</Text>
							</Tooltip>
							<Tooltip content="Copy">
								<IconButton
									type="button"
									size="1"
									variant="ghost"
									color="gray"
									className="!cursor-pointer"
									onClick={(event) => handleCopy(event, description)}
								>
									<CopyIcon width="12" height="12" className="pointer-events-none" />
								</IconButton>
							</Tooltip>
						</Flex>
					)}
				</Flex>

				{/* badge & actions */}
				<Flex align="center" className="ml-auto shrink-0" gap="2">
					{/* counter */}
					{showCounter && (
						<Flex align="center" gap="2" mx="2">
							<IconButton
								size="1"
								variant="ghost"
								color="gray"
								className="!cursor-pointer"
								disabled={counterValue === 0}
								onClick={(e) => {
									e.stopPropagation();
									onCounterChange(counterValue - 1);
								}}
							>
								<MinusIcon width="12" height="12" />
							</IconButton>

							<TextField.Root
								size="1"
								color="gray"
								variant="soft"
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								value={counterValue}
								onClick={(e) => e.stopPropagation()}
								onChange={(e) => {
									const val = e.target.value.replace(/\D/g, "");
									const parsedVal = parseInt(val) || 0;

									if (parsedVal > maxCounterValue) {
										onCounterChange(maxCounterValue);
									} else {
										onCounterChange(parsedVal);
									}
								}}
								className={`text-center !grow-0 shrink-0 min-w-[36px] max-w-[90px] w-[calc(${counterValue.toString().length}ch+16px)]`}
							/>

							<IconButton
								size="1"
								variant="ghost"
								color="gray"
								className="!cursor-pointer"
								disabled={(!isChosen && isCounterLimitReached) || counterValue >= maxCounterValue}
								onClick={(e) => {
									e.stopPropagation();
									onCounterChange(counterValue + 1);
								}}
							>
								<PlusIcon width="12" height="12" />
							</IconButton>
						</Flex>
					)}

					<Flex direction="column" align="end" gap="1" className="min-w-0 ">
						{renderBadge()}

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
};

export { ListCard };
