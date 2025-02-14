/*
  # Fix user creation trigger

  1. Changes
    - Drop and recreate the user creation trigger with better error handling
    - Add default values for required fields
    - Add proper error handling

  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with proper error handling
  INSERT INTO public.profiles (
    id,
    name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error (in a real production system, you'd want proper error logging)
  RAISE NOTICE 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();