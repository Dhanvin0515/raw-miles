-- ============================================================
-- Migration: 006_upi_payments.sql
-- Description: Updates the bookings schema to support manual 
-- UPI payments and verification states.
-- ============================================================

-- 1. Alter bookings status constraint
-- Drop existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new constraint including 'pending_verification'
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending_payment', 'pending_verification', 'confirmed', 'cancelled', 'failed'));

-- 2. Alter payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT;
