"use client";

import { useState } from "react";

// hooks
import { useToast } from "@/context/ToastContext";

// components
import { Flex, Text, Button, TextField } from "@radix-ui/themes";

import Body from "@/components/Body";

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
			<Text size="7" weight="light" className="select-none">
				WarehouseApp
			</Text>

			{/* form */}
			<Flex asChild width="100%" maxWidth="400px" direction="column" align="stretch" gap="4">
				<form onSubmit={handleSubmit}>
					{/* fields */}
					<Flex direction="column" gap="2" width="100%">
						{/* username field */}
						<Flex direction="column" align="stretch" gap="1" width="100%">
							<Text htmlFor="username" size="2" weight="bold" className="select-none">
								Username
							</Text>
							<TextField.Root
								autoFocus
								required
								name="username"
								id="username"
								type="text"
								autoCapitalize="false"
								autoCorrect="false"
								spellCheck="false"
								disabled={isLoading}
							/>
						</Flex>

						{/* password field */}
						<Flex direction="column" align="stretch" gap="1" width="100%">
							<Text htmlFor="password" size="2" weight="bold" className="select-none">
								Password
							</Text>
							<TextField.Root
								required
								name="password"
								id="password"
								type="password"
								autoCapitalize="false"
								autoCorrect="false"
								spellCheck="false"
								disabled={isLoading}
							/>
						</Flex>
					</Flex>

					{/* button */}
					<Button size="3" type="submit" disabled={isLoading} loading={isLoading} className="!cursor-pointer w-full">
						Sign in
					</Button>
				</form>
			</Flex>
		</Body>
	);
}
