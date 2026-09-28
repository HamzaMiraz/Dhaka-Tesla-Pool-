const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export type Session = { token: string; user: { id: string; name: string; role: "PASSENGER" | "DRIVER" } };
export async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers }, cache: "no-store" });
  const body = await response.json(); if (!response.ok) throw new Error(body.error || "Something went wrong"); return body;
}
export const money = (paisa: number) => `৳${(paisa / 100).toFixed(0)}`;
