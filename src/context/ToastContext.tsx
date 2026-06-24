"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// components
import { Toast } from "@/components/Toast";

// types
import { ToastType } from "@/types/ToastMessage";

type ToastContextType = {
	show: (type: ToastType, message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const [toastData, setToastData] = useState<{
		message: string;
		type: ToastType;
		duration: number;
	} | null>(null);

	const handleDismiss = useCallback(() => {
		setToastData(null);
	}, []);

	const show = useCallback((type: ToastType, message: string, duration = 5000) => {
		setToastData(null);

		// Μικρό timeout για να γίνει re-mount το component αν σκάσει συνεχόμενο ίδιο toast
		setTimeout(() => {
			setToastData({ message, type, duration });
		}, 10);
	}, []);

	return (
		<ToastContext.Provider value={{ show }}>
			{children}

			{toastData && <Toast message={toastData.message} type={toastData.type} duration={toastData.duration} onDismiss={handleDismiss} />}
		</ToastContext.Provider>
	);
};

const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

export { ToastProvider, useToast };
