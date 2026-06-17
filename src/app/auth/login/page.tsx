"use client";

import { useState } from "react";

// hooks
import { useToast } from "@/context/ToastContext";

// components
import { Flex, Box } from "@radix-ui/themes";

import Body from "@/components/Body";
import Label from "@/components/Label";
import { Input } from "@/components/Input";
import Button from "@/components/Button";

// actions
import { login } from "./actions";

export default function Page() {
	const [isLoading, setIsLoading] = useState(false);

	const toast = useToast();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		const form = event.currentTarget;

		try {
			const result = await login(new FormData(form));

			if (result?.type && result?.message) {
				setIsLoading(false);

				toast.show(result.type, result.message);
				if (result?.data) console.log(result.data);

				const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
				if (passwordInput) passwordInput.value = "";
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (message.includes("NEXT_REDIRECT")) return;

			setIsLoading(false);

			console.error(error);
			toast.show("error", "An unexpected error occurred. Please try again.");
		}
	}

	return (
		<Body centered>
			{/* title */}
			<Label size="7" weight="light">
				WarehouseApp
			</Label>

			{/* form */}
			<Box width="100%" maxWidth="400px">
				<Flex asChild direction="column" align="stretch" gap="4" width="100%">
					<form onSubmit={handleSubmit}>
						{/* fields */}
						<Flex direction="column" gap="2" width="100%">
							{/* username field */}
							<Flex direction="column" align="stretch" gap="1" width="100%">
								<Label htmlFor="username" size="2" weight="bold">
									Username
								</Label>
								<Input autoFocus name="username" id="username" type="text" required disabled={isLoading} />
							</Flex>

							{/* password field */}
							<Flex direction="column" align="stretch" gap="1" width="100%">
								<Label htmlFor="password" size="2" weight="bold">
									Password
								</Label>
								<Input name="password" id="password" type="password" required disabled={isLoading} />
							</Flex>
						</Flex>

						{/* button */}
						<Button type="submit" disabled={isLoading} loading={isLoading} className="w-full">
							Sign in
						</Button>
					</form>
				</Flex>
			</Box>
		</Body>
	);
}
