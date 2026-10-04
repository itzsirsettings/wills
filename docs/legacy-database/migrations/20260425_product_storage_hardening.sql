-- Product image storage bucket used by the admin service manager.
-- Writes are performed only by the server with the Supabase service role key.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'products',
  'products',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow public read access to product images'
  ) THEN
    CREATE POLICY "Allow public read access to product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'products');
  END IF;
END $$;
