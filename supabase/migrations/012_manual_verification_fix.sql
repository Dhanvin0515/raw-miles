-- Ensure the manual UPI verification flow works on existing databases.

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending_payment', 'pending_verification', 'confirmed', 'cancelled', 'failed'));

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS travelers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT;