"use client";

import React, { useEffect, useRef } from "react";

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
			variant="soft"
			color={toastColors[type]}
			onClick={onDismiss}
			className="select-none fixed z-100 top-[10%] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[400px]"
		>
			<Callout.Icon>{toastIcons[type]}</Callout.Icon>
			<Callout.Text className="min-w-0 flex-1" weight="medium">
				{message}
			</Callout.Text>
		</Callout.Root>
	);
};

Toast.displayName = "Toast";
export { Toast };
