"use client";

import React from "react";
import { Button as ButtonComponent } from "@radix-ui/themes";

// types
import type { Responsive } from "@radix-ui/themes/props";

type ButtonSize = "small" | "default";
type ButtonSizes = Responsive<"1" | "2" | "3" | "4">;

type ButtonProps = {
	size?: "small" | "default";
	type?: "button" | "reset" | "submit";
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
	className?: string;
	children?: React.ReactNode;
};

// data
const sizes: Record<ButtonSize, ButtonSizes> = {
	small: "2",
	default: "3",
};

const Button = React.forwardRef<React.ComponentRef<typeof ButtonComponent>, ButtonProps>(
	({ size = "default", type = "button", disabled = false, loading = false, onClick, className, children, ...props }, ref) => {
		return (
			<ButtonComponent
				ref={ref}
				size={sizes[size]}
				variant="solid"
				type={type}
				disabled={disabled}
				loading={loading}
				onClick={onClick}
				className={`!cursor-pointer !font-bold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
				{...props}
			>
				{children}
			</ButtonComponent>
		);
	},
);

Button.displayName = "Button";

export default Button;
