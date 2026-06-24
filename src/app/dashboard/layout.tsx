// components
import { Navigation } from "@/components/Navigation";
import { Body } from "@/components/Body";

export const dynamic = "force-dynamic";
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navigation />
			<Body>{children}</Body>
		</>
	);
}
