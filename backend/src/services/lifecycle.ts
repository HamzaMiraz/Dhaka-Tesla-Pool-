import { PoolStatus } from "@prisma/client";
const transitions: Record<PoolStatus, PoolStatus[]> = {
  MATCHED: ["ACCEPTED", "CANCELLED"], ACCEPTED: ["DRIVER_ARRIVED", "CANCELLED"],
  DRIVER_ARRIVED: ["STARTED", "CANCELLED"], STARTED: ["COMPLETED"], COMPLETED: [], CANCELLED: []
};
export function canTransition(from: PoolStatus, to: PoolStatus) { return transitions[from].includes(to); }
