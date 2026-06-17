"use client";

import * as React from "react";
import { TextField } from "@radix-ui/themes";

const Input = React.forwardRef<React.ComponentRef<typeof TextField.Root>, React.ComponentPropsWithoutRef<typeof TextField.Root>>(
	({ className, size = "2", variant = "surface", ...props }, ref) => {
		return (
			<TextField.Root
				ref={ref}
				size={size}
				variant={variant}
				className={className}
				autoCapitalize="false"
				autoCorrect="false"
				spellCheck="false"
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

export { Input };
