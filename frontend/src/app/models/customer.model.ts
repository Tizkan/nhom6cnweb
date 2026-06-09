export interface Customer {
  id?: number;
  full_name: string;
  phone: string;
  email?: string;
  citizen_id?: string;
  address?: string;
  created_at?: string;
  booking_count?: number | string;
  total_spent?: number | string;
  last_booking_date?: string | null;
}
