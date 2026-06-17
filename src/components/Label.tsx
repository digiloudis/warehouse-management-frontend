"use client";

import * as React from "react";

// components
import * as LabelPrimitive from "@radix-ui/react-label";
import { Text } from "@radix-ui/themes";

const Label = React.forwardRef<
	React.ComponentRef<typeof LabelPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & React.ComponentPropsWithoutRef<typeof Text>
>(({ size = "3", weight = "medium", align = "left", className, children, ...props }, ref) => (
	<LabelPrimitive.Root ref={ref} {...props}>
		<Text as="p" size={size} weight={weight} align={align} className={`select-none w-full block ${className ?? ""}`}>
			{children}
		</Text>
	</LabelPrimitive.Root>
));

Label.displayName = "Label";
export default Label;
