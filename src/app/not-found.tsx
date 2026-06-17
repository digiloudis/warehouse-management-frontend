"use client";

import { Box, Flex } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import Link from "next/link";

// components
import Label from "@/components/Label";
import Button from "@/components/Button";

export default function NotFoundPage() {
	const router = useRouter();

	return (
		<Flex direction="column" align="center" justify="center" className="min-h-screen bg-[var(--gray-1)] p-6">
			<Flex direction="column" gap="5" className="max-w-[400px] w-full text-center">
				{/* 1. Breadcrumb / Back Navigation */}
				<Box className="text-left">
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 text-[var(--gray-10)] hover:text-[var(--slate-12)] transition-colors text-sm font-medium"
					>
						<ArrowLeftIcon /> Back to Dashboard
					</Link>
				</Box>

				{/* 2. Error Content */}
				<Flex direction="column" gap="2" align="center">
					<Label size="9" weight="bold" className="text-[var(--slate-12)] tracking-tighter leading-none select-none" style={{ fontSize: "120px" }}>
						404
					</Label>
					<Label size="5" weight="bold" className="text-[var(--slate-12)] mt-2">
						Page Not Found
					</Label>
					<Label size="3" className="text-[var(--gray-10)] px-4">
						The page you are looking for doesn&apos;t exist or has been moved to another URL.
					</Label>
				</Flex>
			</Flex>
		</Flex>
	);
}
