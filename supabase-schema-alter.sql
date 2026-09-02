-- ============================================================================
-- הוספת עמודות חסרות לטבלאות קיימות
-- הרץ את זה ב-Supabase אחרי ה-schema הראשי
-- ============================================================================

-- ============================================================================
-- SystemSettings - עמודות camelCase נוספות
-- ============================================================================
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "dualNoticeMode" BOOLEAN DEFAULT false;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "pauseAllSessionAdvance" BOOLEAN DEFAULT false;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "screenProfile" TEXT DEFAULT '50';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "groupRotationSeconds" INTEGER DEFAULT 8;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "noticeRotationSeconds" INTEGER DEFAULT 20;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "specialNoticeRotationSeconds" INTEGER DEFAULT 8;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "timerTitle" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "timerFullScreenMinutes" INTEGER DEFAULT 3;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "overrideMode" TEXT DEFAULT 'none';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "overrideDay" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "customModeConfig" JSONB DEFAULT '{}';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "boardDesign" JSONB DEFAULT '{}';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "fixedRules" JSONB DEFAULT '[]';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "tickerText" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "contactInfo" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "operatingHours" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "kickoffConfig" JSONB DEFAULT '{}';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "breakConfig" JSONB DEFAULT '{}';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "motzeiConfig" JSONB DEFAULT '{}';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "backgroundRotationEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "backgrounds" JSONB DEFAULT '[]';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "congratsCTAEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "congratsCTAText" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "congratsCTALink" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "congratsRotationSeconds" INTEGER DEFAULT 60;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "tickerEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "ticker_enabled" BOOLEAN DEFAULT true;

-- ============================================================================
-- DaySchedule - עמודות camelCase נוספות
-- ============================================================================
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "dayOfWeek" TEXT;
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "weekStartDate" DATE;
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "pauseAllSessionAdvance" BOOLEAN DEFAULT false;
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "allCircleMembers" JSONB DEFAULT '[]';
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "internalCircleLists" JSONB DEFAULT '[]';
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "circleDisplayMode" TEXT DEFAULT 'all';
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "hideInternalCircle" BOOLEAN DEFAULT false;
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "hideSmallGroups" BOOLEAN DEFAULT false;
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "smallGroups" JSONB DEFAULT '[]';
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "workshops" JSONB DEFAULT '[]';
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "congratulations" JSONB DEFAULT '[]';

-- ============================================================================
-- SpecialNotice - מאגר הודעות מיוחדות לבלוק צדדי
-- ============================================================================
CREATE TABLE IF NOT EXISTS "SpecialNotice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  "displaySeconds" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "SpecialNotice" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "SpecialNotice";
CREATE POLICY "Allow all access" ON "SpecialNotice" FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_special_notice_active ON "SpecialNotice"(active);
DROP TRIGGER IF EXISTS update_special_notice_updated_at ON "SpecialNotice";
CREATE TRIGGER update_special_notice_updated_at BEFORE UPDATE ON "SpecialNotice"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "dutyPerson" TEXT;

-- ============================================================================
-- Notice - עמודות camelCase נוספות
-- ============================================================================
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "isFullScreen" BOOLEAN DEFAULT false;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "displaySeconds" INTEGER;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "targetDate" DATE;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN DEFAULT false;

-- Image animation & slideshow columns
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageUrls" JSONB DEFAULT '[]';
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageAnimationEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageAnimationEffects" JSONB DEFAULT '[]';
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageAnimationSpeed" TEXT DEFAULT 'normal';
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageGlowColor" TEXT DEFAULT '#8FAE9B';
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "textGlowEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;

-- ============================================================================
-- PhoneNumbers - עמודות camelCase נוספות (אם יש צורך)
-- ============================================================================
-- PhoneNumbers נראה בסדר עם snake_case

-- ============================================================================
-- TickerItem - טבלת פריטי אינסרט חדשה
-- ============================================================================
CREATE TABLE IF NOT EXISTS "TickerItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "TickerItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "TickerItem";
CREATE POLICY "Allow all access" ON "TickerItem"
  FOR ALL USING (true) WITH CHECK (true);

DROP INDEX IF EXISTS idx_ticker_item_active;
CREATE INDEX idx_ticker_item_active ON "TickerItem"(active);

DROP TRIGGER IF EXISTS update_ticker_item_updated_at ON "TickerItem";
CREATE TRIGGER update_ticker_item_updated_at BEFORE UPDATE ON "TickerItem"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! כל העמודות נוספו
-- ============================================================================
