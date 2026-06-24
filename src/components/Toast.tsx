"use client";

import { useEffect, useRef } from "react";

// components
import { Callout } from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

// types
import { ToastMessage, ToastType } from "@/types/ToastMessage";

const toastColors: Record<ToastType, "green" | "amber" | "red"> = {
	success: "green",
	warning: "amber",
	error: "red",
};

const toastIcons: Record<ToastType, React.ReactElement> = {
	success: <CheckCircledIcon width="16" height="16" />,
	warning: <ExclamationTriangleIcon width="16" height="16" />,
	error: <InfoCircledIcon width="16" height="16" />,
};

const Toast = ({ message, type = "warning", duration = 5000, onDismiss }: ToastMessage) => {
	const onDismissRef = useRef(onDismiss);

	useEffect(() => {
		onDismissRef.current = onDismiss;
	}, [onDismiss]);

	useEffect(() => {
		if (!message) return;

		const timer = setTimeout(() => {
			onDismissRef.current();
		}, duration);

		return () => clearTimeout(timer);
	}, [message, duration]);

	if (!message) return null;

	return (
		<Callout.Root
			size="1"
			variant="surface"
			color={toastColors[type]}
			onClick={onDismiss}
			style={{
				position: "fixed",
				zIndex: 2147483647,
				top: "80px",
				left: "50%",
				transform: "translateX(-50%)",

				// Layout & Styling
				width: "calc(100% - 48px)",
				maxWidth: "360px",
				boxShadow: "var(--shadow-4)",
				pointerEvents: "auto",
				backgroundImage: "none",
				display: "flex",
				alignItems: "center",
				gap: "12px",

				// Interaction styles
				cursor: "pointer", // 💡 Δείχνει στον χρήστη ότι είναι clickable
				userSelect: "none",
			}}
			// 💡 Προσθήκη hover:opacity για ένα διακριτικό feedback κατά το hover
			className="animate-in fade-in slide-in-from-top-4 duration-200 hover:opacity-90 transition-opacity"
		>
			<Callout.Icon>{toastIcons[type]}</Callout.Icon>

			{/* 💡 Το κείμενο πλέον πιάνει όλο τον εναπομείναντα χώρο χωρίς δεσμεύσεις για κουμπιά */}
			<Callout.Text className="min-w-0 flex-1" weight="medium">
				{message}
			</Callout.Text>
		</Callout.Root>
	);
};

Toast.displayName = "Toast";
export default Toast;
