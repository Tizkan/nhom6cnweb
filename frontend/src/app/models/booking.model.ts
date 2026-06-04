export interface Booking {
  id?: number;

  customer_id: number;

  room_id: number;

  check_in: string;

  check_out: string;

  adults: number;

  children: number;

  total_amount: number;

  status: string;
}
