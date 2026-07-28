-- Migration: allow admins to delete bookings and related payment rows
-- Purpose: support admin deletion of bookings from the admin panel

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'bookings_admin_delete'
  ) THEN
    CREATE POLICY "bookings_admin_delete" ON public.bookings
      FOR DELETE USING (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'payments_admin_delete'
  ) THEN
    CREATE POLICY "payments_admin_delete" ON public.payments
      FOR DELETE USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = payments.booking_id AND is_admin()
      ));
  END IF;
END $$;
