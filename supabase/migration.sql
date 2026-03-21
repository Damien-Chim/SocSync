-- ============================================================
-- SocSync Complete Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'host');

CREATE TYPE event_category AS ENUM (
  'Tech',
  'Finance',
  'Career',
  'Workshop',
  'Competition',
  'Social',
  'Arts & Culture',
  'Networking'
);


-- 2. TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  society_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Societies
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  category event_category NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from profiles.society_id -> societies.id (deferred because of circular ref)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_society
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL;

-- Society follows (student follows/likes a society)
CREATE TABLE society_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, society_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price NUMERIC,
  has_free_food BOOLEAN NOT NULL DEFAULT false,
  registration_link TEXT,
  banner_image_url TEXT,
  category event_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved events (student bookmarks an event)
CREATE TABLE saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

-- Event registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page views (per-user page visit history)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer_path TEXT,
  session_id UUID,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_society_follows_user ON society_follows(user_id);
CREATE INDEX idx_society_follows_society ON society_follows(society_id);
CREATE INDEX idx_events_society ON events(society_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_saved_events_user ON saved_events(user_id);
CREATE INDEX idx_saved_events_event ON saved_events(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);


-- 4. VIEWS
-- ============================================================

-- Societies with computed follower + event counts
CREATE VIEW societies_with_counts AS
SELECT
  s.*,
  COALESCE(fc.follower_count, 0)::INT AS follower_count,
  COALESCE(ec.event_count, 0)::INT AS event_count
FROM societies s
LEFT JOIN (
  SELECT society_id, COUNT(*) AS follower_count
  FROM society_follows GROUP BY society_id
) fc ON fc.society_id = s.id
LEFT JOIN (
  SELECT society_id, COUNT(*) AS event_count
  FROM events GROUP BY society_id
) ec ON ec.society_id = s.id;

-- Events with society info + save count
CREATE VIEW events_with_details AS
SELECT
  e.*,
  s.name AS society_name,
  s.logo_url AS society_logo,
  s.category AS society_category,
  COALESCE(sc.save_count, 0)::INT AS save_count,
  COALESCE(rc.registration_count, 0)::INT AS registration_count
FROM events e
JOIN societies s ON s.id = e.society_id
LEFT JOIN (
  SELECT event_id, COUNT(*) AS save_count
  FROM saved_events GROUP BY event_id
) sc ON sc.event_id = e.id
LEFT JOIN (
  SELECT event_id, COUNT(*) AS registration_count
  FROM event_registrations GROUP BY event_id
) rc ON rc.event_id = e.id;


-- 5. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_societies_updated_at
  BEFORE UPDATE ON societies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Notify followers when a new event is created
CREATE OR REPLACE FUNCTION notify_society_followers()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, society_id, event_id, message)
  SELECT
    sf.user_id,
    NEW.society_id,
    NEW.id,
    (SELECT name FROM societies WHERE id = NEW.society_id) || ' posted: ' || NEW.title
  FROM society_follows sf
  WHERE sf.society_id = NEW.society_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_event_created
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION notify_society_followers();


-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view any profile"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Societies
CREATE POLICY "Anyone can view societies"
  ON societies FOR SELECT USING (true);

CREATE POLICY "Hosts can create societies"
  ON societies FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Hosts can update own societies"
  ON societies FOR UPDATE USING (auth.uid() = created_by);

-- Society follows
CREATE POLICY "Anyone can view follows"
  ON society_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow societies"
  ON society_follows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow societies"
  ON society_follows FOR DELETE USING (auth.uid() = user_id);

-- Events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT USING (true);

CREATE POLICY "Hosts can create events for their society"
  ON events FOR INSERT WITH CHECK (
    society_id IN (SELECT id FROM societies WHERE created_by = auth.uid())
  );

CREATE POLICY "Hosts can update their society events"
  ON events FOR UPDATE USING (
    society_id IN (SELECT id FROM societies WHERE created_by = auth.uid())
  );

CREATE POLICY "Hosts can delete their society events"
  ON events FOR DELETE USING (
    society_id IN (SELECT id FROM societies WHERE created_by = auth.uid())
  );

-- Saved events
CREATE POLICY "Users can view own saved events"
  ON saved_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save events"
  ON saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave events"
  ON saved_events FOR DELETE USING (auth.uid() = user_id);

-- Event registrations
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view registrations for their events"
  ON event_registrations FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN societies s ON s.id = e.society_id
      WHERE s.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events"
  ON event_registrations FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Page views
CREATE POLICY "Users can insert own page views"
  ON page_views FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own page history"
  ON page_views FOR SELECT USING (auth.uid() = user_id);
