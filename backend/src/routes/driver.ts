import { Router } from "express";
import { PoolStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { canTransition } from "../services/lifecycle";
const router = Router(); router.use(authenticate, requireRole("DRIVER"));
router.get("/pools", async (req, res) => {
  const pools = await prisma.pool.findMany({ where: { vehicle: { driverId: req.user!.id } }, include: { vehicle: true, members: { include: { request: { include: { passenger: { select: { name: true, email: true } } } } } }, events: true }, orderBy: { createdAt: "desc" } });
  res.json(pools);
});
router.patch("/availability", async (req, res) => {
  const vehicle = await prisma.vehicle.update({ where: { driverId: req.user!.id }, data: { online: Boolean(req.body.online) } }); res.json(vehicle);
});
for (const [path, target] of Object.entries({ accept: PoolStatus.ACCEPTED, arrive: PoolStatus.DRIVER_ARRIVED, start: PoolStatus.STARTED, complete: PoolStatus.COMPLETED })) {
  router.post(`/pools/:id/${path}`, async (req, res) => {
    const pool = await prisma.pool.findFirst({ where: { id: req.params.id, vehicle: { driverId: req.user!.id } } });
    if (!pool) return res.status(404).json({ error: "Pool not found" });
    if (!canTransition(pool.status, target)) return res.status(409).json({ error: `Cannot move from ${pool.status} to ${target}` });
    const updated = await prisma.$transaction(async tx => { const p = await tx.pool.update({ where: { id: pool.id }, data: { status: target } }); await tx.rideEvent.create({ data: { poolId: p.id, status: target } }); return p; });
    res.json(updated);
  });
}
export default router;
