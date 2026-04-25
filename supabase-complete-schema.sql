-- ============================================================================
-- SUPABASE COMPLETE SCHEMA - Smart Schedule Display
-- ============================================================================
-- זה הקובץ המלא! הרץ את זה בבת אחת וזה ייצור את הכל
-- Supabase Studio: SQL Editor → New query → Paste → Run
-- ============================================================================

-- ============================================================================
-- 1. System Settings Table (COMPLETE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "SystemSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  -- Snake case columns (original)
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
  ticker_text TEXT,
  contact_info TEXT,
  operating_hours TEXT,
  fixed_rules JSONB DEFAULT '[]',
  backgrounds JSONB DEFAULT '[]',
  background_rotation_enabled BOOLEAN DEFAULT true,
  -- Camel case columns (for React compatibility)
  "dualNoticeMode" BOOLEAN DEFAULT false,
  "pauseAllSessionAdvance" BOOLEAN DEFAULT false,
  "screenProfile" TEXT DEFAULT '50',
  "groupRotationSeconds" INTEGER DEFAULT 8,
  "noticeRotationSeconds" INTEGER DEFAULT 20,
  "timerTitle" TEXT,
  "timerFullScreenMinutes" INTEGER DEFAULT 3,
  "overrideMode" TEXT DEFAULT 'none',
  "overrideDay" TEXT,
  "customModeConfig" JSONB DEFAULT '{}',
  "boardDesign" JSONB DEFAULT '{}',
  "fixedRules" JSONB DEFAULT '[]',
  "tickerText" TEXT,
  "contactInfo" TEXT,
  "operatingHours" TEXT,
  "kickoffConfig" JSONB DEFAULT '{}',
  "breakConfig" JSONB DEFAULT '{}',
  "motzeiConfig" JSONB DEFAULT '{}',
  "backgroundRotationEnabled" BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "SystemSettings";
CREATE POLICY "Allow all access" ON "SystemSettings"
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. Day Schedule Table (COMPLETE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "DaySchedule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  -- Snake case
  day_of_week TEXT,
  week_start_date DATE,
  workshops JSONB DEFAULT '[]',
  small_groups JSONB DEFAULT '[]',
  internal_circle_lists JSONB DEFAULT '[]',
  all_circle_members JSONB DEFAULT '[]',
  circle_display_mode TEXT DEFAULT 'all',
  congratulations JSONB DEFAULT '[]',
  pause_all_session_advance BOOLEAN DEFAULT false,
  -- Camel case (React compatibility)
  "dayOfWeek" TEXT,
  "weekStartDate" DATE,
  "pauseAllSessionAdvance" BOOLEAN DEFAULT false,
  "allCircleMembers" JSONB DEFAULT '[]',
  "internalCircleLists" JSONB DEFAULT '[]',
  "circleDisplayMode" TEXT DEFAULT 'all',
  "hideInternalCircle" BOOLEAN DEFAULT false,
  "hideSmallGroups" BOOLEAN DEFAULT false,
  "smallGroups" JSONB DEFAULT '[]',
  "workshops" JSONB DEFAULT '[]',
  "congratulations" JSONB DEFAULT '[]',
  "dutyPerson" TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "DaySchedule" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "DaySchedule";
CREATE POLICY "Allow all access" ON "DaySchedule"
  FOR ALL USING (true) WITH CHECK (true);

DROP INDEX IF EXISTS idx_day_schedule_day_of_week;
CREATE INDEX idx_day_schedule_day_of_week ON "DaySchedule"(day_of_week);

-- ============================================================================
-- 3. Notice Table (COMPLETE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Notice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT,
  -- Snake case
  pdf_url TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  days TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  target_date DATE,
  display_seconds INTEGER,
  is_full_screen BOOLEAN DEFAULT false,
  -- Camel case (React compatibility)
  "pdfUrl" TEXT,
  "imageUrl" TEXT,
  "isFullScreen" BOOLEAN DEFAULT false,
  "displaySeconds" INTEGER,
  "targetDate" DATE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "Notice" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "Notice";
CREATE POLICY "Allow all access" ON "Notice"
  FOR ALL USING (true) WITH CHECK (true);

DROP INDEX IF EXISTS idx_notice_active;
CREATE INDEX idx_notice_active ON "Notice"(active);

-- ============================================================================
-- 4. Phone Numbers Table (COMPLETE)
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

ALTER TABLE "PhoneNumbers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "PhoneNumbers";
CREATE POLICY "Allow all access" ON "PhoneNumbers"
  FOR ALL USING (true) WITH CHECK (true);

DROP INDEX IF EXISTS idx_phone_numbers_active;
CREATE INDEX idx_phone_numbers_active ON "PhoneNumbers"(active);

-- ============================================================================
-- 5. Storage Bucket for Files
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects
  FOR ALL USING (bucket_id = 'files') WITH CHECK (bucket_id = 'files');

-- ============================================================================
-- 6. Auto-update Function & Triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate triggers
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
-- 7. Sample Data (Optional - for testing)
-- ============================================================================
INSERT INTO "SystemSettings" (
  id, organization_name, theme, screen_scale, auto_refresh, 
  screen_profile, group_rotation_seconds, notice_rotation_seconds
) VALUES (
  '1', 'Smart Schedule Display', 'default', '32', true, '50', 8, 20
) ON CONFLICT (id) DO NOTHING;

INSERT INTO "Notice" (title, content, active, priority) VALUES
  ('Welcome', 'ברוכים הבאים ללוח המודעות', true, 1),
  ('Meeting', 'מפגש צוות היום בשעה 15:00', true, 2)
ON CONFLICT DO NOTHING;

INSERT INTO "PhoneNumbers" (label, number, category, active) VALUES
  ('מוקד שירות', '072-2351290', 'כללי', true),
  ('חירום', '911', 'חירום', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE! הכל נוצר בהצלחה
-- ============================================================================
