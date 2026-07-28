-- Add a new JSONB column 'travelers' to the 'bookings' table
ALTER TABLE public.bookings ADD COLUMN travelers JSONB DEFAULT '[]'::jsonb;
