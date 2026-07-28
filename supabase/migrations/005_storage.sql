-- 005_storage.sql
-- Setup Supabase Storage for Images

-- Create a new public bucket named 'images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for objects in 'images'
-- Public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Admin write access (insert)
CREATE POLICY "Admin Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin write access (update)
CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin delete access
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
