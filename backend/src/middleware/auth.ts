import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
const secret = () => process.env.JWT_SECRET || "unsafe-development-secret";
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try { req.user = jwt.verify(token, secret()) as { id: string; role: Role }; next(); }
  catch { return res.status(401).json({ error: "Invalid or expired token" }); }
}
export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => req.user?.role === role ? next() : res.status(403).json({ error: "Forbidden" });
}
export function tokenFor(user: { id: string; role: Role }) { return jwt.sign(user, secret(), { expiresIn: "7d" }); }
