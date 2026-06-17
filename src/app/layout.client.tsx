"use client";

import React, { useEffect, useState } from "react";

// components
import { Flex, Spinner } from "@radix-ui/themes";

import Body from "@/components/Body";
import Label from "@/components/Label";

// actions
import { wakeup } from "@/app/actions";

interface InitiatorProps {
	children: React.ReactNode;
}

function Initiator({ children }: InitiatorProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		let keepAliveInterval: NodeJS.Timeout;
		let retryTimeout: NodeJS.Timeout;

		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		const checkConnection = async () => {
			try {
				const [apiSuccess] = await Promise.all([
					wakeup(),
					delay(5000), // Εδώ το είχες 10000 (10s), το άλλαξα σε 5000 (5s) όπως ζήτησες
				]);

				if (apiSuccess) {
					setIsLoaded(true);

					keepAliveInterval = setInterval(
						async () => {
							console.log("Sending keep-alive ping to Render API...");
							await wakeup();
						},
						5 * 60 * 1000,
					);
				} else {
					console.log("Backend is spinning up... retrying in 3s");
					retryTimeout = setTimeout(checkConnection, 3000);
				}
			} catch (error) {
				console.error("Connection failed, retrying...", error);
				retryTimeout = setTimeout(checkConnection, 3000);
			}
		};

		checkConnection();

		return () => {
			if (retryTimeout) clearTimeout(retryTimeout);
			if (keepAliveInterval) clearInterval(keepAliveInterval);
		};
	}, []);

	if (!isLoaded) {
		return (
			<Body centered>
				<Spinner size="3" />
				<Flex direction="column" align="center" gap="1">
					<Label as="p" size="4" weight="bold" align="center">
						Starting the app...
					</Label>
					<Label as="p" size="2" color="gray" align="center">
						Please wait a moment while the server wakes up.
					</Label>
				</Flex>
			</Body>
		);
	}

	return <>{children}</>;
}

export { Initiator };
