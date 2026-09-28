"use client";
import { FormEvent, useState } from "react";
import { api, Session } from "../lib/api";
export function Login({ role, onLogin }: { role: "PASSENGER" | "DRIVER"; onLogin: (session: Session) => void }) {
  const [email, setEmail] = useState(role === "DRIVER" ? "jashim@dhakatesla.test" : "nusrat@dhakatesla.test"); const [password, setPassword] = useState("Tesla123!"); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); try { const session = await api<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); if (session.user.role !== role) throw new Error(`Please use a ${role.toLowerCase()} account`); onLogin(session); } catch (e) { setError(e instanceof Error ? e.message : "Login failed"); } }
  return <form className="card login" onSubmit={submit}><h2>{role === "DRIVER" ? "Driver console" : "Passenger sign in"}</h2><p className="subtle small">Demo credentials are already filled in.</p><label className="field">Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" /></label><label className="field">Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" /></label>{error && <p className="notice">{error}</p>}<button>Sign in</button></form>;
}
