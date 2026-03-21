-- Add end_time column to events table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;
