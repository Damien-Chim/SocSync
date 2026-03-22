-- Add instagram_post_url column to events table for tracking scraped events
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE events ADD COLUMN IF NOT EXISTS instagram_post_url TEXT;

-- Unique partial index prevents the same Instagram post from being inserted twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_instagram_url
  ON events(instagram_post_url) WHERE instagram_post_url IS NOT NULL;
