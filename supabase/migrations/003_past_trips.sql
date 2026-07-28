-- ============================================================
-- Add Past Trip Images to Site Settings
-- ============================================================

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS past_trip_images TEXT[] NOT NULL DEFAULT '{}';

-- Seed initial past trip images (optional)
UPDATE site_settings
SET past_trip_images = ARRAY[
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&q=80',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1504280387672-3f8d227fcefb?w=800&q=80'
]
WHERE id = 1 AND (past_trip_images IS NULL OR array_length(past_trip_images, 1) IS NULL);
