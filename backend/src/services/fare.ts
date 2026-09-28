export const BASE_FARE_PAISA = 5_000;
export const RATE_PER_KM_PAISA = 2_000;
export const POOL_DISCOUNT_PAISA = 3_000;
export function calculateFarePaisa(distanceKm: number, pooled = true) {
  return BASE_FARE_PAISA + distanceKm * RATE_PER_KM_PAISA - (pooled ? POOL_DISCOUNT_PAISA : 0);
}
