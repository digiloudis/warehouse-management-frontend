"use client";

import { useRouter } from "next/navigation";

// components
import { Flex, Text, Button, Badge } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import Body from "@/components/Body";

export default function Page() {
	const router = useRouter();

	return (
		<Body centered short>
			{/* badge */}
			<Badge size="2" className="select-none">
				404
			</Badge>

			{/* message */}
			<Flex direction="column" gap="2" align="center" className="items-center content-center text-center">
				<Text size="8" weight="bold" className="select-none">
					Page not found
				</Text>
				<Text size="3" color="gray" className="select-none">
					Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
				</Text>
			</Flex>

			{/* back button */}
			<Button variant="soft" color="gray" size="2" onClick={() => router.back()}>
				<Flex align="center" gap="2">
					<ArrowLeftIcon width="16" height="16" />
					Go back
				</Flex>
			</Button>
		</Body>
	);
}
