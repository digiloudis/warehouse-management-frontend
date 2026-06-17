"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Badge, Card, Dialog, Select, TextField } from "@radix-ui/themes";
import { ArrowDownIcon, ArrowUpIcon, CounterClockwiseClockIcon, PlusIcon, MinusIcon } from "@radix-ui/react-icons";

// components
import { Navigation } from "@/components/Navigation";
import { Content } from "@/components/Content";
import Label from "@/components/Label";
import Button from "@/components/Button";

// actions
import { getTransactions, getProductsForSelect, createTransaction } from "./actions";

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<Array<any>>([]);
	const [products, setProducts] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	// Modal States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState<"in" | "out">("in");
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [quantity, setQuantity] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		const txResult = await getTransactions();
		if (txResult.success) setTransactions(txResult.data);

		const prodResult = await getProductsForSelect();
		if (prodResult.success) setProducts(prodResult.data);

		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const openTransactionModal = (type: "in" | "out") => {
		setModalType(type);
		setSelectedProductId("");
		setQuantity("");
		setFormError(null);
		setIsModalOpen(true);
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProductId || !quantity) {
			setFormError("Please select a product and enter quantity.");
			return;
		}

		const parsedQty = parseInt(quantity, 10);
		if (isNaN(parsedQty) || parsedQty <= 0) {
			setFormError("Quantity must be a positive integer.");
			return;
		}

		setSubmitting(true);
		setFormError(null);

		const result = await createTransaction(modalType, {
			productId: Number(selectedProductId),
			quantity: parsedQty,
		});

		if (result.success) {
			setIsModalOpen(false);
			fetchData(); // Refresh logs
		} else {
			setFormError(result.error || "Transaction failed.");
		}
		setSubmitting(false);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("el-GR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<>
			<Navigation />
			<Content>
				{/* Header */}
				<Flex justify="between" align="end" mb="4">
					<Flex direction="column" gap="2">
						<Label size="8" weight="bold" className="text-[var(--slate-12)] tracking-tight">
							Transactions Log
						</Label>
						<Label size="3" className="text-[var(--gray-10)]">
							Real-time audit log of all stock movements across facilities.
						</Label>
					</Flex>

					{/* Action Buttons */}
					<Flex gap="2" mb="1">
						<Button className="cursor-pointer" onClick={() => openTransactionModal("in")}>
							<PlusIcon /> Stock In
						</Button>
						<Button className="cursor-pointer" onClick={() => openTransactionModal("out")}>
							<MinusIcon /> Stock Out
						</Button>
					</Flex>
				</Flex>

				{/* Transactions List */}
				<Flex direction="column" gap="2">
					{loading ? (
						<Card variant="surface" className="p-8 text-center">
							<Label size="2" color="gray" className="animate-pulse">
								Loading transaction logs...
							</Label>
						</Card>
					) : transactions.length === 0 ? (
						<Box className="p-8 text-center bg-[var(--gray-2)] border border-dashed border-[var(--gray-6)] rounded-[var(--radius-3)]">
							<Label size="2" color="gray" className="italic">
								No transactions recorded yet.
							</Label>
						</Box>
					) : (
						transactions.map((tx) => {
							const isIncoming = tx.type === "IN";

							return (
								<Card key={tx.id} variant="surface" className="p-4 hover:border-[var(--gray-6)] transition-colors">
									<Flex justify="between" align="center">
										<Flex align="center" gap="4">
											{/* Icon Indicator */}
											<Box
												className="p-2 rounded-[var(--radius-2)] border"
												style={{
													backgroundColor: isIncoming ? "var(--green-2)" : "var(--red-2)",
													borderColor: isIncoming ? "var(--green-4)" : "var(--red-4)",
													color: isIncoming ? "var(--green-11)" : "var(--red-11)",
												}}
											>
												{isIncoming ? <ArrowDownIcon width="18" height="18" /> : <ArrowUpIcon width="18" height="18" />}
											</Box>

											<Box>
												<Label size="4" weight="bold" className="block text-[var(--slate-12)]">
													{tx.productName}
												</Label>
												<Flex gap="2" className="mt-0.5" align="center">
													<Label size="2" color="gray">
														Warehouse ID: #{tx.warehouseId}
													</Label>
													<Label size="2" className="text-[var(--gray-8)]">
														•
													</Label>
													<Flex align="center" gap="1" className="text-[var(--gray-9)]">
														<CounterClockwiseClockIcon width="12" height="12" />
														<Label size="2">{formatDate(tx.date)}</Label>
													</Flex>
												</Flex>
											</Box>
										</Flex>

										<Flex align="center" gap="3">
											<Box className="text-right">
												<Label size="4" weight="bold" style={{ color: isIncoming ? "var(--green-11)" : "var(--red-11)" }}>
													{isIncoming ? "+" : "-"}
													{tx.quantity}
												</Label>
												<Label size="1" color="gray" className="block">
													units
												</Label>
											</Box>

											<Badge color={isIncoming ? "green" : "red"} variant="soft" size="2">
												{tx.type}
											</Badge>
										</Flex>
									</Flex>
								</Card>
							);
						})
					)}
				</Flex>

				{/* 🌟 Radix Dialog Modal for Creating Transactions */}
				<Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
					<Dialog.Content size="3" style={{ maxWidth: 450 }}>
						<Dialog.Title>{modalType === "in" ? "Stock Inbound (IN)" : "Stock Outbound (OUT)"}</Dialog.Title>
						<Dialog.Description size="2" className="mb-4 text-[var(--gray-10)]">
							{modalType === "in"
								? "Add incoming stock quantity to a specific product catalog item."
								: "Remove quantity from a product item due to dispatch or adjustment."}
						</Dialog.Description>

						<form onSubmit={handleFormSubmit}>
							<Flex direction="column" gap="4">
								{/* Product Select Dropdown */}
								<Flex direction="column" gap="1">
									<Label size="2" weight="bold" className="text-[var(--slate-12)]">
										Select Product
									</Label>
									<Select.Root value={selectedProductId} onValueChange={setSelectedProductId} disabled={submitting}>
										<Select.Trigger placeholder="Choose a product..." className="w-full" />
										<Select.Content>
											{products.map((p) => {
												const currentId = p.id ?? p.productId;
												return (
													<Select.Item key={currentId} value={String(currentId)}>
														{p.name} (Barcode: {p.barcode})
													</Select.Item>
												);
											})}
										</Select.Content>
									</Select.Root>
								</Flex>

								{/* Quantity Input */}
								<Flex direction="column" gap="1">
									<Label size="2" weight="bold" className="text-[var(--slate-12)]">
										Quantity (units)
									</Label>
									<TextField.Root
										type="number"
										min="1"
										placeholder="e.g. 50"
										value={quantity}
										onChange={(e) => setQuantity(e.target.value)}
										disabled={submitting}
									/>
								</Flex>

								{/* Form Validation Error Handling */}
								{formError && (
									<Label size="2" color="red" weight="medium">
										{formError}
									</Label>
								)}

								{/* Buttons inside Modal */}
								<Flex gap="3" justify="end" mt="2">
									<Dialog.Close>
										<Button type="button" disabled={submitting} className="cursor-pointer">
											Cancel
										</Button>
									</Dialog.Close>
									<Button type="submit" disabled={submitting} className="cursor-pointer">
										{submitting ? "Processing..." : modalType === "in" ? "Confirm Add" : "Confirm Remove"}
									</Button>
								</Flex>
							</Flex>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</Content>
		</>
	);
}
