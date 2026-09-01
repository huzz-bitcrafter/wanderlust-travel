-- Migration 003: Avatars Storage Bucket & RLS Policies
-- Execute in Supabase SQL editor if the 'avatars' storage bucket policies need manual provisioning.

-- 1. Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Allow public read on avatars bucket
CREATE POLICY "Public read on avatars bucket"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
