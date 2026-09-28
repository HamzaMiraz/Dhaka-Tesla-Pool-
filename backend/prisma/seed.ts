import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateFarePaisa } from "../src/services/fare";
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash("Tesla123!", 12);
  const jashim = await prisma.user.upsert({ where: { email: "jashim@dhakatesla.test" }, update: {}, create: { name: "Jashim", email: "jashim@dhakatesla.test", passwordHash, role: Role.DRIVER } });
  const vehicle = await prisma.vehicle.upsert({ where: { name: "Bullet" }, update: { online: true }, create: { name: "Bullet", capacity: 3, driverId: jashim.id } });
  const people = await Promise.all(["Nusrat", "Rafiq", "Shirin"].map(name => prisma.user.upsert({ where: { email: `${name.toLowerCase()}@dhakatesla.test` }, update: {}, create: { name, email: `${name.toLowerCase()}@dhakatesla.test`, passwordHash, role: Role.PASSENGER } })));
  const existing = await prisma.pool.findFirst({ where: { vehicleId: vehicle.id, pickupZone: "Banani", status: "MATCHED" } });
  if (!existing) {
    const pool = await prisma.pool.create({ data: { vehicleId: vehicle.id, pickupZone: "Banani" } });
    for (const [person, destinationZone, distanceKm] of [[people[0], "Mohakhali", 5], [people[1], "Gulshan 1", 4]] as const) {
      const request = await prisma.rideRequest.create({ data: { passengerId: person.id, pickupZone: "Banani", destinationZone, distanceKm, seats: 1, status: "MATCHED" } });
      await prisma.poolMember.create({ data: { poolId: pool.id, requestId: request.id, seats: 1, farePaisa: calculateFarePaisa(distanceKm) } });
    }
  }
  console.log("Seeded Jashim, Bullet, Nusrat, Rafiq and Shirin");
}
main().finally(() => prisma.$disconnect());
