import { Router } from "express";
import { z } from "zod";
import { PoolStatus, RequestStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../middleware/auth";
import { calculateFarePaisa } from "../services/fare";
import { hasCapacity } from "../services/capacity";
const router = Router();
const requestSchema = z.object({ pickupZone: z.string().min(2), destinationZone: z.string().min(2), distanceKm: z.number().int().positive().max(100), seats: z.number().int().min(1).max(3).default(1) });
router.use(authenticate, requireRole("PASSENGER"));
router.get("/mine", async (req, res) => {
  const requests = await prisma.rideRequest.findMany({ where: { passengerId: req.user!.id }, include: { member: { include: { pool: { include: { vehicle: true } } } } }, orderBy: { createdAt: "desc" } });
  res.json(requests);
});
router.post("/", async (req, res, next) => {
  try {
    const input = requestSchema.parse(req.body);
    const request = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findFirst({ where: { online: true }, orderBy: { name: "asc" } });
      if (!vehicle) throw new Error("No driver is currently online");
      let pool = await tx.pool.findFirst({ where: { vehicleId: vehicle.id, pickupZone: input.pickupZone, status: "MATCHED" }, include: { members: true } });
      if (!pool) pool = await tx.pool.create({ data: { vehicleId: vehicle.id, pickupZone: input.pickupZone }, include: { members: true } });
      await tx.$queryRaw`SELECT id FROM "Pool" WHERE id = ${pool.id} FOR UPDATE`;
      const lockedPool = await tx.pool.findUniqueOrThrow({ where: { id: pool.id }, include: { members: true } });
      const occupied = lockedPool.members.reduce((sum, member) => sum + member.seats, 0);
      if (!hasCapacity(vehicle.capacity, occupied, input.seats)) throw new Error("No seats available in this pool");
      const created = await tx.rideRequest.create({ data: { ...input, passengerId: req.user!.id, status: RequestStatus.MATCHED } });
      await tx.poolMember.create({ data: { poolId: pool.id, requestId: created.id, seats: input.seats, farePaisa: calculateFarePaisa(input.distanceKm) } });
      return created;
    });
    res.status(201).json(request);
  } catch (error) { next(error); }
});
router.post("/:id/cancel", async (req, res, next) => {
  try {
    const ride = await prisma.rideRequest.findFirst({ where: { id: req.params.id, passengerId: req.user!.id }, include: { member: { include: { pool: true } } } });
    if (!ride) return res.status(404).json({ error: "Ride request not found" });
    const cancellablePoolStatuses: PoolStatus[] = [PoolStatus.MATCHED, PoolStatus.ACCEPTED];
    if (!["REQUESTED", "MATCHED"].includes(ride.status) || (ride.member && !cancellablePoolStatuses.includes(ride.member.pool.status))) return res.status(409).json({ error: "This ride can no longer be cancelled" });
    await prisma.rideRequest.update({ where: { id: ride.id }, data: { status: "CANCELLED" } });
    res.json({ message: "Ride cancelled" });
  } catch (error) { next(error); }
});
export default router;
