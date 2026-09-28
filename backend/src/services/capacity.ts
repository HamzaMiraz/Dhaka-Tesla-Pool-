export function hasCapacity(capacity: number, occupiedSeats: number, requestedSeats: number) {
  return occupiedSeats + requestedSeats <= capacity;
}
