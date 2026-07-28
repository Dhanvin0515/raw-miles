ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS upi_qr_url_2 TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS upi_id_1 TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS upi_id_2 TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_counter INT DEFAULT 0;
