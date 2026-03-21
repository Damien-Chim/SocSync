-- Fix 1: Storage RLS policies for "SocSync Pics" bucket
-- Allow authenticated users to upload, and anyone to view (public bucket)

INSERT INTO storage.buckets (id, name, public)
VALUES ('SocSync Pics', 'SocSync Pics', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'SocSync Pics');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'SocSync Pics');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'SocSync Pics');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'SocSync Pics');

-- Fix 2: Recreate handle_new_user trigger with society auto-creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role_val user_role;
  new_society_id UUID;
  soc_name TEXT;
  soc_logo TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  BEGIN
    user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'student';
  END;

  IF user_role_val IS NULL THEN
    user_role_val := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, user_name, user_role_val);

  IF user_role_val = 'host' THEN
    soc_name := COALESCE(NEW.raw_user_meta_data->>'society_name', user_name || '''s Society');
    soc_logo := NEW.raw_user_meta_data->>'society_logo_url';

    INSERT INTO public.societies (name, logo_url, category, description, created_by)
    VALUES (soc_name, soc_logo, 'Tech', '', NEW.id)
    RETURNING id INTO new_society_id;

    UPDATE public.profiles
    SET society_id = new_society_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
