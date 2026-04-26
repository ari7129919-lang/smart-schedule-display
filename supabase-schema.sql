-- ============================================================================
-- Supabase Schema for Smart Schedule Display
-- ============================================================================
-- הרץ את זה ב-Supabase: SQL Editor → New query → Paste → Run
-- ============================================================================

-- ============================================================================
-- 1. System Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "SystemSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_name TEXT,
  theme TEXT DEFAULT 'default',
  screen_scale TEXT DEFAULT '32',
  auto_refresh BOOLEAN DEFAULT true,
  board_design JSONB DEFAULT '{}',
  dual_notice_mode BOOLEAN DEFAULT false,
  pause_all_session_advance BOOLEAN DEFAULT false,
  screen_profile TEXT DEFAULT '50',
  group_rotation_seconds INTEGER DEFAULT 8,
  notice_rotation_seconds INTEGER DEFAULT 20,
  timer_title TEXT,
  timer_full_screen_minutes INTEGER DEFAULT 3,
  override_mode TEXT DEFAULT 'none',
  override_day TEXT,
  custom_mode_config JSONB DEFAULT '{}',
  "customModeConfig" JSONB DEFAULT '{}',
  ticker_text TEXT,
  contact_info TEXT,
  operating_hours TEXT,
  fixed_rules JSONB DEFAULT '[]',
  backgrounds JSONB DEFAULT '[]',
  background_rotation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow all access" ON "SystemSettings";

-- Allow all access (for public/internal app)
CREATE POLICY "Allow all access" ON "SystemSettings"
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. Day Schedule Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "DaySchedule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  day_of_week TEXT NOT NULL,
  week_start_date DATE,
  workshops JSONB DEFAULT '[]',
  small_groups JSONB DEFAULT '[]',
  internal_circle_lists JSONB DEFAULT '[]',
  all_circle_members JSONB DEFAULT '[]',
  circle_display_mode TEXT DEFAULT 'full',
  congratulations JSONB DEFAULT '[]',
  pause_all_session_advance BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE "DaySchedule" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON "DaySchedule";

CREATE POLICY "Allow all access" ON "DaySchedule"
  FOR ALL USING (true) WITH CHECK (true);

-- Index for day_of_week queries
DROP INDEX IF EXISTS idx_day_schedule_day_of_week;
CREATE INDEX idx_day_schedule_day_of_week ON "DaySchedule"(day_of_week);

-- ============================================================================
-- 3. Notice Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Notice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  image_url TEXT,
  pdfUrl TEXT,
  imageUrl TEXT,
  active BOOLEAN DEFAULT true,
  days TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  target_date DATE,
  targetDate DATE,
  display_seconds INTEGER,
  displaySeconds INTEGER,
  is_full_screen BOOLEAN DEFAULT false,
  isFullScreen BOOLEAN DEFAULT false,
  layout TEXT DEFAULT 'single',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE "Notice" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON "Notice";

CREATE POLICY "Allow all access" ON "Notice"
  FOR ALL USING (true) WITH CHECK (true);

-- Index for active notices
DROP INDEX IF EXISTS idx_notice_active;
CREATE INDEX idx_notice_active ON "Notice"(active);

-- ============================================================================
-- 4. Phone Numbers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "PhoneNumbers" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  number TEXT NOT NULL,
  category TEXT DEFAULT 'כללי',
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE "PhoneNumbers" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON "PhoneNumbers";

CREATE POLICY "Allow all access" ON "PhoneNumbers"
  FOR ALL USING (true) WITH CHECK (true);

-- Index for active phone numbers
DROP INDEX IF EXISTS idx_phone_numbers_active;
CREATE INDEX idx_phone_numbers_active ON "PhoneNumbers"(active);

-- ============================================================================
-- 5. Create Storage Bucket for Files (Images/PDFs)
-- ============================================================================
-- This creates a public bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects
  FOR ALL USING (bucket_id = 'files') WITH CHECK (bucket_id = 'files');

-- ============================================================================
-- 6. Sample Data (Optional - for testing)
-- ============================================================================

-- Insert default system settings
INSERT INTO "SystemSettings" (
  id, organization_name, theme, screen_scale, auto_refresh, 
  screen_profile, group_rotation_seconds, notice_rotation_seconds
) VALUES (
  '1', 'Smart Schedule Display', 'default', '32', true, '50', 8, 20
) ON CONFLICT (id) DO NOTHING;

-- Insert sample notices
INSERT INTO "Notice" (title, content, active, priority) VALUES
  ('Welcome', 'ברוכים הבאים ללוח המודעות', true, 1),
  ('Meeting', 'מפגש צוות היום בשעה 15:00', true, 2)
ON CONFLICT DO NOTHING;

-- Insert sample phone numbers
INSERT INTO "PhoneNumbers" (label, number, category, active) VALUES
  ('מוקד שירות', '072-2351290', 'כללי', true),
  ('חירום', '911', 'חירום', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. Function to auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON "SystemSettings";
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON "SystemSettings"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_day_schedule_updated_at ON "DaySchedule";
CREATE TRIGGER update_day_schedule_updated_at BEFORE UPDATE ON "DaySchedule"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notice_updated_at ON "Notice";
CREATE TRIGGER update_notice_updated_at BEFORE UPDATE ON "Notice"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phone_numbers_updated_at ON "PhoneNumbers";
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON "PhoneNumbers"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! הטבלאות נוצרו בהצלחה
-- ============================================================================
