-- Fix: handle_new_user trigger was crashing on enum cast
-- Paste this into Supabase Dashboard > SQL Editor and run it

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role_val user_role;
BEGIN
  -- Safely extract name
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Safely extract role with fallback
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
