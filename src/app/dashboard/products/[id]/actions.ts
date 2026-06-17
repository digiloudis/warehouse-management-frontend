"use server";

import { request } from "@/lib/api";

export async function getProductDetails(id: string) {
	try {
		const prodId = parseInt(id, 10);

		// 1. Fetch βασικά στοιχεία προϊόντος
		const productRes = await request(`/Products/${prodId}`, { protected: true });
		const product = await productRes.json();

		// 2. Fetch τις τοποθεσίες/αποθήκες (Υποθέτω υπάρχει ένα global inventory ή warehouse list)
		// Αν το API σου έχει endpoint π.χ. /Products/{id}/inventory χρησιμοποίησε αυτό.
		// Εδώ θα ζητήσουμε το inventory για να δούμε πού υπάρχει.
		let locations: Array<any> = [];
		try {
			const invRes = await request(`/inventory`, { protected: true }); // ή κατάλληλο endpoint
			const invData = await invRes.json();

			// Φιλτράρουμε να κρατήσουμε μόνο τις εγγραφές αυτού του προϊόντος
			locations = Array.isArray(invData) ? invData.filter((item: any) => item.productId === prodId) : [];
		} catch (e) {
			console.log("Could not fetch product locations");
		}

		return {
			success: true,
			product,
			locations,
		};
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
