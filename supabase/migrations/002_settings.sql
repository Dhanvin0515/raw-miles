-- ============================================================
-- Site Settings Table
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row table
  hero_images TEXT[] NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "site_settings_admin_update" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "site_settings_admin_insert" ON site_settings FOR INSERT WITH CHECK (is_admin());

-- Seed the initial row
INSERT INTO site_settings (id, hero_images) VALUES (
  1,
  ARRAY[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=85',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=85',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85'
  ]
) ON CONFLICT (id) DO NOTHING;
