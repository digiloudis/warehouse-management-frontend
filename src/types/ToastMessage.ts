type ToastType = "success" | "warning" | "error";

type ToastMessage = {
	type: ToastType;
	message: string;
	duration?: number;
	onDismiss: () => void;
};

export type { ToastType, ToastMessage };
