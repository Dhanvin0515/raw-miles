-- Add review_count to packages and keep it synced with review changes.

ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0;

UPDATE public.packages p
SET review_count = COALESCE(r.review_count, 0)
FROM (
  SELECT package_id, COUNT(*)::INT AS review_count
  FROM public.reviews
  GROUP BY package_id
) r
WHERE p.id = r.package_id;

CREATE OR REPLACE FUNCTION update_package_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_package_id UUID;
BEGIN
  v_package_id := COALESCE(NEW.package_id, OLD.package_id);

  UPDATE public.packages
  SET
    avg_rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE package_id = v_package_id), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE package_id = v_package_id)
  WHERE id = v_package_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
