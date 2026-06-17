"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// radix primitives
import { Box, Flex } from "@radix-ui/themes";
import { PlusIcon, ArrowLeftIcon } from "@radix-ui/react-icons";

// components
import { Navigation } from "@/components/Navigation";
import Body from "@/components/Body";
import Label from "@/components/Label";
import Button from "@/components/Button";

// actions
import { getRole } from "@/app/actions";
import { getWarehouses } from "./actions";

export default function Page() {
	const router = useRouter();
	const [warehouses, setWarehouses] = useState<Array<any>>([]);
	const [userRole, setUserRole] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			// Παράλληλο fetch για αποθήκες και role
			const [warehousesResult, roleResult] = await Promise.all([getWarehouses(), getRole()]);

			if (warehousesResult.success) {
				setWarehouses(warehousesResult.data);
			}

			setUserRole(roleResult);
			setLoading(false);
		})();
	}, []);

	return (
		<>
			<Navigation />
			<Body>
				{/* 1. Navigation Back Button */}
				<Box>
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 text-[var(--gray-10)] hover:text-[var(--slate-12)] transition-colors text-sm font-medium"
					>
						<ArrowLeftIcon /> Back to Dashboard
					</Link>
				</Box>

				{/* header - Το gap διαχειρίζεται το layout αν μικρύνει η οθόνη */}
				<Flex width="100%" direction="row" justify="between" align="center" gap="4">
					{/* text */}
					<Flex direction="column" gap="1">
						<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
							Warehouses
						</Label>
						<Label size="3" className="text-[var(--gray-10)]">
							Overview of your storage facilities, current capacity, and location management.
						</Label>
					</Flex>

					{/* Εμφάνιση του Create Button ΜΟΝΟ αν το role είναι 1 */}
					{!loading && userRole === 1 && (
						<Button className="cursor-pointer flex-shrink-0">
							<PlusIcon />
							Create
						</Button>
					)}
				</Flex>

				{/* list */}
				<Flex width="100%" direction="column" gap="3">
					{loading ? (
						<Label size="2" color="gray" className="animate-pulse">
							Loading warehouses...
						</Label>
					) : warehouses.length === 0 ? (
						<Label size="2" color="gray" className="italic text-center p-4">
							No warehouses found.
						</Label>
					) : (
						warehouses.map((warehouse) => {
							const currentId = warehouse.id ?? warehouse.warehouseId;

							return (
								<WarehouseCard
									key={currentId ?? Math.random()}
									warehouse={warehouse}
									onClick={() => {
										if (currentId) {
											router.push(`/dashboard/warehouses/${currentId}`);
										} else {
											console.error("Could not find ID on warehouse object:", warehouse);
										}
									}}
								/>
							);
						})
					)}
				</Flex>
			</Body>
		</>
	);
}

// 🌟 Helper Component: WarehouseCard
interface WarehouseCardProps {
	warehouse: any;
	onClick: () => void;
}

function WarehouseCard({ warehouse, onClick }: WarehouseCardProps) {
	return (
		<Flex
			width="100%"
			direction="row"
			justify="between"
			align="center"
			gap="4"
			p="4"
			onClick={onClick}
			className="bg-[var(--color-surface)] border border-[var(--gray-5)] rounded-[var(--radius-3)] hover:border-[var(--gray-7)] transition-colors cursor-pointer"
		>
			<Flex direction="column" gap="1">
				<Label size="4" weight="bold" className="block">
					{warehouse.name}
				</Label>
				<Label size="2" color="gray">
					{warehouse.location}
				</Label>
			</Flex>

			<Label size="2" weight="medium">
				{warehouse.capacity}
			</Label>
		</Flex>
	);
}
