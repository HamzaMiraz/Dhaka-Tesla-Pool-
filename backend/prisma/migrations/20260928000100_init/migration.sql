-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASSENGER', 'DRIVER');
CREATE TYPE "RequestStatus" AS ENUM ('REQUESTED', 'MATCHED', 'CANCELLED');
CREATE TYPE "PoolStatus" AS ENUM ('MATCHED', 'ACCEPTED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED');

-- CreateTables
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Vehicle" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "capacity" INTEGER NOT NULL, "online" BOOLEAN NOT NULL DEFAULT true,
  "driverId" TEXT NOT NULL, CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RideRequest" (
  "id" TEXT NOT NULL, "passengerId" TEXT NOT NULL, "pickupZone" TEXT NOT NULL, "destinationZone" TEXT NOT NULL,
  "distanceKm" INTEGER NOT NULL, "seats" INTEGER NOT NULL DEFAULT 1, "status" "RequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RideRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Pool" (
  "id" TEXT NOT NULL, "vehicleId" TEXT NOT NULL, "pickupZone" TEXT NOT NULL, "status" "PoolStatus" NOT NULL DEFAULT 'MATCHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PoolMember" (
  "id" TEXT NOT NULL, "poolId" TEXT NOT NULL, "requestId" TEXT NOT NULL, "seats" INTEGER NOT NULL, "farePaisa" INTEGER NOT NULL,
  CONSTRAINT "PoolMember_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RideEvent" (
  "id" TEXT NOT NULL, "poolId" TEXT NOT NULL, "status" "PoolStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RideEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Vehicle_name_key" ON "Vehicle"("name");
CREATE UNIQUE INDEX "Vehicle_driverId_key" ON "Vehicle"("driverId");
CREATE INDEX "RideRequest_passengerId_status_idx" ON "RideRequest"("passengerId", "status");
CREATE INDEX "Pool_vehicleId_status_idx" ON "Pool"("vehicleId", "status");
CREATE UNIQUE INDEX "PoolMember_requestId_key" ON "PoolMember"("requestId");
CREATE INDEX "PoolMember_poolId_idx" ON "PoolMember"("poolId");

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RideRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RideEvent" ADD CONSTRAINT "RideEvent_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;