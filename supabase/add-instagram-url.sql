-- Add instagram_url column to societies table
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE societies ADD COLUMN IF NOT EXISTS instagram_url TEXT;
