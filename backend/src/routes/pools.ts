import { Router } from "express";
import { prisma } from "../prisma";
const router = Router();
router.get("/", async (_req, res) => {
  const pools = await prisma.pool.findMany({ where: { status: { in: ["MATCHED", "ACCEPTED", "DRIVER_ARRIVED", "STARTED"] } }, include: { vehicle: true, members: true }, orderBy: { createdAt: "desc" } });
  res.json(pools.map(pool => ({ ...pool, occupiedSeats: pool.members.reduce((n, m) => n + m.seats, 0) })));
});
export default router;
