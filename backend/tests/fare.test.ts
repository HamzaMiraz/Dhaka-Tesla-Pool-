import { describe, expect, it } from "vitest";
import { calculateFarePaisa } from "../src/services/fare";
import { canTransition } from "../src/services/lifecycle";
import { hasCapacity } from "../src/services/capacity";
describe("fare model", () => {
  it("calculates Nusrat's pooled fare", () => expect(calculateFarePaisa(5)).toBe(12000));
  it("calculates Rafiq's pooled fare", () => expect(calculateFarePaisa(4)).toBe(10000));
});
describe("ride lifecycle", () => {
  it("allows a normal lifecycle transition", () => expect(canTransition("MATCHED", "ACCEPTED")).toBe(true));
  it("rejects skipping directly to completed", () => expect(canTransition("MATCHED", "COMPLETED")).toBe(false));
});
describe("Bullet capacity", () => {
  it("never permits a fourth occupied seat in its three-seat vehicle", () => expect(hasCapacity(3, 3, 1)).toBe(false));
  it("permits the final available seat", () => expect(hasCapacity(3, 2, 1)).toBe(true));
});
