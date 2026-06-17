"use client";

import { Button, DropdownMenu } from "@radix-ui/themes";
import { PlusIcon, CaretDownIcon } from "@radix-ui/react-icons";

interface ActionDropdownProps {
	label: string;
	items: {
		label: string;
		onClick: () => void;
		color?: "gray" | "red";
		icon?: React.ReactNode;
	}[];
}

export const ActionDropdown = ({ label, items }: ActionDropdownProps) => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button size="3" variant="solid" className="cursor-pointer">
					<PlusIcon />
					{label}
					<CaretDownIcon />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content variant="soft" color="indigo">
				{items.map((item, index) => (
					<DropdownMenu.Item key={index} onClick={item.onClick} color={item.color} className="cursor-pointer">
						{item.icon}
						{item.label}
					</DropdownMenu.Item>
				))}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
};
