-- Delete existing policies if they exist
DROP POLICY IF EXISTS "Users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Chat files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their chat files" ON storage.objects;

-- Create new policies for chatImages bucket
CREATE POLICY "Allow public uploads to chatImages" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chatImages');

CREATE POLICY "Allow public access to chatImages" ON storage.objects
FOR SELECT USING (bucket_id = 'chatImages');

CREATE POLICY "Allow public updates to chatImages" ON storage.objects
FOR UPDATE USING (bucket_id = 'chatImages');

CREATE POLICY "Allow public deletes from chatImages" ON storage.objects
FOR DELETE USING (bucket_id = 'chatImages');

-- Create new policies for chatFiles bucket
CREATE POLICY "Allow public uploads to chatFiles" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chatFiles');

CREATE POLICY "Allow public access to chatFiles" ON storage.objects
FOR SELECT USING (bucket_id = 'chatFiles');

CREATE POLICY "Allow public updates to chatFiles" ON storage.objects
FOR UPDATE USING (bucket_id = 'chatFiles');

CREATE POLICY "Allow public deletes from chatFiles" ON storage.objects
FOR DELETE USING (bucket_id = 'chatFiles');