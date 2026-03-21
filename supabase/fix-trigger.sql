-- Fix: handle_new_user trigger
-- Now also creates a society + links it when a host signs up
-- Paste this into Supabase Dashboard > SQL Editor and run it

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role_val user_role;
  new_society_id UUID;
  soc_name TEXT;
  soc_logo TEXT;
  soc_category event_category;
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

    BEGIN
      soc_category := (NEW.raw_user_meta_data->>'society_category')::event_category;
    EXCEPTION WHEN OTHERS THEN
      soc_category := 'Tech';
    END;

    INSERT INTO public.societies (name, logo_url, category, description, created_by)
    VALUES (soc_name, soc_logo, soc_category, '', NEW.id)
    RETURNING id INTO new_society_id;

    UPDATE public.profiles
    SET society_id = new_society_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
