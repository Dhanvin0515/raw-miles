-- ============================================================
-- Raw Miles — Full Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name    TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS packages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  destination_id      UUID REFERENCES destinations(id),
  short_description   TEXT,
  description         TEXT,
  duration_days       INT NOT NULL DEFAULT 1,
  duration_nights     INT NOT NULL DEFAULT 1,
  base_price          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  start_date          DATE,
  end_date            DATE,
  inclusions          TEXT[],
  exclusions          TEXT[],
  hotel_info          TEXT,
  transport_info      TEXT,
  cover_image_url     TEXT,
  gallery_image_urls  TEXT[],
  total_slots         INT NOT NULL DEFAULT 20,
  slots_booked        INT NOT NULL DEFAULT 0 CHECK (slots_booked >= 0),
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  avg_rating          NUMERIC(3,2) DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slots_valid CHECK (slots_booked <= total_slots)
);

CREATE TABLE IF NOT EXISTS package_itinerary (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  day_number  INT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS package_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS package_addons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('flat','percentage')),
  discount_value  NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  valid_from      DATE,
  valid_until     DATE,
  max_uses        INT,
  times_used      INT NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id),
  package_id          UUID NOT NULL REFERENCES packages(id),
  category_id         UUID REFERENCES package_categories(id),
  num_travelers       INT NOT NULL CHECK (num_travelers > 0),
  addon_ids           UUID[],
  coupon_id           UUID REFERENCES coupons(id),
  subtotal            NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  status              TEXT NOT NULL DEFAULT 'pending_payment'
                        CHECK (status IN ('pending_payment','confirmed','cancelled','failed')),
  cancelled_by        UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  refund_status       TEXT CHECK (refund_status IN ('not_applicable','pending','refunded')),
  lead_name           TEXT,
  lead_email          TEXT,
  lead_phone          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id            UUID NOT NULL REFERENCES bookings(id),
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT UNIQUE,
  razorpay_signature    TEXT,
  amount                NUMERIC(12,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created','paid','failed','refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  invoice_number  TEXT UNIQUE NOT NULL,
  gst_amount      NUMERIC(12,2),
  total_amount    NUMERIC(12,2),
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id),
  booking_id  UUID NOT NULL REFERENCES bookings(id),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, package_id)
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_itinerary   ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_addons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND (is_admin() OR role = (SELECT role FROM profiles WHERE id = auth.uid())));

CREATE POLICY "destinations_select_all" ON destinations FOR SELECT USING (TRUE);
CREATE POLICY "destinations_admin_insert" ON destinations FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "destinations_admin_update" ON destinations FOR UPDATE USING (is_admin());
CREATE POLICY "destinations_admin_delete" ON destinations FOR DELETE USING (is_admin());

CREATE POLICY "packages_select_published" ON packages FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "packages_admin_insert" ON packages FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "packages_admin_update" ON packages FOR UPDATE USING (is_admin());
CREATE POLICY "packages_admin_delete" ON packages FOR DELETE USING (is_admin());

CREATE POLICY "itinerary_select_all" ON package_itinerary FOR SELECT USING (TRUE);
CREATE POLICY "itinerary_admin_write" ON package_itinerary FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "itinerary_admin_update" ON package_itinerary FOR UPDATE USING (is_admin());
CREATE POLICY "itinerary_admin_delete" ON package_itinerary FOR DELETE USING (is_admin());

CREATE POLICY "categories_select_all" ON package_categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write" ON package_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_admin_update" ON package_categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_admin_delete" ON package_categories FOR DELETE USING (is_admin());

CREATE POLICY "addons_select_all" ON package_addons FOR SELECT USING (TRUE);
CREATE POLICY "addons_admin_write" ON package_addons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "addons_admin_update" ON package_addons FOR UPDATE USING (is_admin());
CREATE POLICY "addons_admin_delete" ON package_addons FOR DELETE USING (is_admin());

CREATE POLICY "coupons_select_active" ON coupons FOR SELECT USING (active = TRUE OR is_admin());
CREATE POLICY "coupons_admin_insert" ON coupons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "coupons_admin_update" ON coupons FOR UPDATE USING (is_admin());
CREATE POLICY "coupons_admin_delete" ON coupons FOR DELETE USING (is_admin());

CREATE POLICY "bookings_select_own" ON bookings FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "bookings_insert_own" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookings_admin_update" ON bookings FOR UPDATE USING (is_admin());

CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE id = payments.booking_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "payments_insert_own" ON payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE id = payments.booking_id AND user_id = auth.uid()));

CREATE POLICY "invoices_select_own" ON invoices FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE id = invoices.booking_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "invoices_admin_insert" ON invoices FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM bookings WHERE id = reviews.booking_id AND user_id = auth.uid() AND status = 'confirmed'));
CREATE POLICY "reviews_admin_delete" ON reviews FOR DELETE USING (is_admin());

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'phone', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_package_rating()
RETURNS TRIGGER AS $$
DECLARE v_package_id UUID;
BEGIN
  v_package_id := COALESCE(NEW.package_id, OLD.package_id);
  UPDATE packages SET avg_rating = (SELECT COALESCE(AVG(rating),0) FROM reviews WHERE package_id = v_package_id) WHERE id = v_package_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change AFTER INSERT OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_package_rating();

-- ============================================================
-- ATOMIC BOOKING CONFIRMATION
-- ============================================================

CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id UUID, p_razorpay_payment_id TEXT, p_razorpay_order_id TEXT, p_razorpay_signature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking bookings;
  v_updated INT;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF v_booking.status = 'confirmed' THEN RETURN TRUE; END IF;
  UPDATE packages SET slots_booked = slots_booked + v_booking.num_travelers WHERE id = v_booking.package_id AND slots_booked + v_booking.num_travelers <= total_slots;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN RETURN FALSE; END IF;
  UPDATE bookings SET status = 'confirmed' WHERE id = p_booking_id;
  UPDATE payments SET razorpay_payment_id = p_razorpay_payment_id, razorpay_signature = p_razorpay_signature, status = 'paid' WHERE booking_id = p_booking_id AND razorpay_order_id = p_razorpay_order_id;
  IF v_booking.coupon_id IS NOT NULL THEN UPDATE coupons SET times_used = times_used + 1 WHERE id = v_booking.coupon_id; END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA REMOVED
-- (Please add your real data through the Admin Dashboard or manual inserts)
-- ============================================================
