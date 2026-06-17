"use client";

import { useEffect, useRef } from "react";

// components
import { Flex, Box, IconButton, Card } from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";

import Label from "./Label";

// types
import { ToastMessage, ToastType } from "@/types/ToastMessage";

// data
const colors: Record<ToastType, string> = {
	success: "var(--green-9)",
	warning: "var(--amber-9)",
	error: "var(--red-9)",
};

const Toast = ({ message, type = "warning", duration = 5000, onDismiss }: ToastMessage) => {
	const onDismissRef = useRef(onDismiss);

	useEffect(() => {
		onDismissRef.current = onDismiss;
	}, [onDismiss]);

	// auto dismiss toast
	useEffect(() => {
		if (!message) return;

		const timer = setTimeout(() => {
			onDismissRef.current();
		}, duration);

		return () => clearTimeout(timer);
	}, [message, duration]);

	if (!message) return null;

	return (
		<Card
			style={{
				maxWidth: "400px",
				position: "fixed",
				zIndex: 100,
				top: "5%",
				left: "5%",
				right: "5%",
				padding: 0,
				margin: "0 auto",
				backgroundColor: colors[type],
				pointerEvents: "auto",
			}}
		>
			<Flex direction="row" align="center" justify="between" p="2" gap="4">
				{/* message */}
				<Box>
					<Label size="2" weight="medium">
						{message}
					</Label>
				</Box>

				{/* button */}
				<IconButton size="1" variant="ghost" className="cursor-pointer" onClick={onDismiss}>
					<Cross1Icon width="12" height="12" />
				</IconButton>
			</Flex>
		</Card>
	);
};

Toast.displayName = "Toast";
export default Toast;
