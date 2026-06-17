"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// lib
import { request } from "@/lib/api";

// types
import { ToastType } from "@/types/ToastMessage";

async function login(formData: FormData): Promise<{ type: ToastType; message: string; data?: object } | undefined> {
	let isLoggedIn = false;

	try {
		const username = formData.get("username")?.toString().trim();
		const password = formData.get("password")?.toString().trim();

		// check inputs
		if (!username || !password) return { type: "warning", message: "Please fill in all fields." };

		// call api
		const response = await request("/auth/login", { method: "POST", body: { username: username, password: password } });

		// check api response
		if (!response.ok) {
			if (response.status === 400 || response.status === 401) return { type: "warning", message: "Incorrect username or password." };
			else return { type: "error", message: "Something went wrong. Please try again later.", data: response };
		}

		const data = await response.json();

		// check authorization
		if (!data?.token) return { type: "error", message: "Sorry, we couldn't log you in. Please try again later." };

		// store jwt & role
		const cookieStorage = await cookies();
		const expiration: Date = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		cookieStorage.set("jwt", data.token, { httpOnly: true, secure: false, path: "/", expires: expiration });
		cookieStorage.set("role", String(data.role), { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", expires: expiration });

		isLoggedIn = true;
	} catch (error) {
		return { type: "error", message: "Network error. Please check your connection and try again." };
	}

	if (isLoggedIn) redirect("/dashboard");
}

async function logout() {
	const cookieStorage = await cookies();
	cookieStorage.delete("jwt");
	cookieStorage.delete("role");

	redirect("/auth/login");
}

export { login, logout };
