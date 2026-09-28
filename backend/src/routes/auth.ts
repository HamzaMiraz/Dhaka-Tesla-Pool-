import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { tokenFor } from "../middleware/auth";
const router = Router();
const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
router.post("/register", async (req, res, next) => {
  try {
    const data = credentials.extend({ name: z.string().min(2), role: z.enum(["PASSENGER", "DRIVER"]).default("PASSENGER") }).parse(req.body);
    const { password, ...userData } = data;
    const user = await prisma.user.create({ data: { ...userData, passwordHash: await bcrypt.hash(password, 12) } });
    res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) { next(error); }
});
router.post("/login", async (req, res, next) => {
  try {
    const data = credentials.parse(req.body); const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) { next(error); }
});
export default router;
