import { cookies } from "next/headers";

// constants
const HOSTNAME: string = process.env["API_HOSTNAME"] || "https://warehousemanagementapi.onrender.com/api";

type RequestOptions = {
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: object | undefined;
	headers?: Record<string, string>;
	protected?: boolean;
};

export async function request(endpoint: string, options: RequestOptions = {}) {
	const url: string = HOSTNAME + endpoint;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...options.headers,
	};

	const body: string | undefined = options.body ? JSON.stringify(options.body) : undefined;

	// if endpoint is protected
	if (options.protected) {
		const cookieStorage = await cookies();
		const token = cookieStorage.get("jwt")?.value;

		if (token) headers["Authorization"] = `Bearer ${token}`;
	}

	// send request
	const response = await fetch(url, {
		method: options.method ?? "GET",
		headers: { ...headers },
		body,
		cache: "no-store",
	});

	return response;
}
