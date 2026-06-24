"use client";

import React, { useEffect, useState } from "react";

// components
import { Flex, Spinner, Text } from "@radix-ui/themes";

import { Body } from "@/components/Body";

// actions
import { wakeup } from "@/app/actions";

interface InitiatorProps {
	children: React.ReactNode;
}

const COOLDOWN_TIME = 3 * 60 * 1000;
const STORAGE_KEY = "backend_last_wakeup";

function Initiator({ children }: InitiatorProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isCheckingStorage, setIsCheckingStorage] = useState(true);

	useEffect(() => {
		let keepAliveInterval: NodeJS.Timeout;
		let retryTimeout: NodeJS.Timeout;

		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		const startKeepAlive = () => {
			if (keepAliveInterval) clearInterval(keepAliveInterval);
			keepAliveInterval = setInterval(
				async () => {
					console.log("Sending keep-alive ping to Render API...");
					await wakeup();
					sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
				},
				5 * 60 * 1000,
			);
		};

		const checkConnection = async () => {
			// 1. ΕΛΕΓΧΟΣ COOLDOWN: Δες αν ξύπνησε πρόσφατα
			const lastWakeup = sessionStorage.getItem(STORAGE_KEY);
			if (lastWakeup) {
				const timePassed = Date.now() - parseInt(lastWakeup, 10);
				if (timePassed < COOLDOWN_TIME) {
					console.log(`Backend was verified ${Math.round(timePassed / 1000)}s ago. Skipping check.`);
					setIsLoaded(true);
					setIsCheckingStorage(false); // Τελειώνει ο έλεγχος, μπαίνουμε ακαριαία
					startKeepAlive();
					return;
				}
			}

			// Αν δεν υπάρχει cooldown, σταματάμε το checking state για να φανεί ο Spinner αν χρειαστεί
			setIsCheckingStorage(false);

			try {
				// Έλεγχος του API με ελάχιστη καθυστέρηση 5 δευτερολέπτων για το εφέ
				const [apiSuccess] = await Promise.all([wakeup(), delay(5000)]);

				if (apiSuccess) {
					// Αποθήκευση timestamp επιτυχίας
					sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
					setIsLoaded(true);
					startKeepAlive();
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

	// 🌟 Όσο διαβάζουμε το sessionStorage (πρώτα 1-2ms), επιστρέφουμε null για να μην φλασάρει ο Loader
	if (isCheckingStorage && !isLoaded) {
		return null;
	}

	// Αν ο έλεγχος τελείωσε και το API είναι όντως κλειστό (δεν υπήρχε cooldown), δείξε τον Spinner
	if (!isLoaded) {
		return (
			<Body centered>
				<Spinner size="3" />
				<Flex direction="column" align="center" gap="1">
					<Text size="4" weight="bold" align="center" className="select-none">
						Starting the app...
					</Text>
					<Text size="2" color="gray" align="center" className="select-none">
						Please wait a moment while the server wakes up.
					</Text>
				</Flex>
			</Body>
		);
	}

	// Αν είμαστε loaded (είτε μέσω cooldown είτε επειδή ξύπνησε τώρα), δείξε την εφαρμογή
	return <>{children}</>;
}

export { Initiator };
