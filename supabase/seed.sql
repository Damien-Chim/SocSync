-- Seed societies into the database
-- Run this in Supabase Dashboard > SQL Editor

INSERT INTO societies (id, name, logo_url, category, description) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Tech Society', 'https://api.dicebear.com/7.x/shapes/svg?seed=tech&backgroundColor=7c3aed', 'Tech', 'Building the future, one hackathon at a time.'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Finance Club', 'https://api.dicebear.com/7.x/shapes/svg?seed=finance&backgroundColor=f97316', 'Finance', 'Learn trading, investing, and financial literacy.'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Business Network', 'https://api.dicebear.com/7.x/shapes/svg?seed=business&backgroundColor=06b6d4', 'Career', 'Connecting students with industry professionals.'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Social Club', 'https://api.dicebear.com/7.x/shapes/svg?seed=social&backgroundColor=ec4899', 'Social', 'Making university life unforgettable.'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Networking Hub', 'https://api.dicebear.com/7.x/shapes/svg?seed=networking&backgroundColor=22c55e', 'Networking', 'Your gateway to career opportunities.');
