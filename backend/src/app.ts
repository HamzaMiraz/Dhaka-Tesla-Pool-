import express from "express"; import cors from "cors";
import auth from "./routes/auth"; import rides from "./routes/rides"; import driver from "./routes/driver"; import pools from "./routes/pools";
export const app = express(); app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", auth); app.use("/api/rides", rides); app.use("/api/driver", driver); app.use("/api/pools", pools);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { const message = error instanceof Error ? error.message : "Unexpected error"; res.status(message.includes("seats") || message.includes("online") ? 409 : 400).json({ error: message }); });
