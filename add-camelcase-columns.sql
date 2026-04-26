-- ============================================================================
-- הוספת עמודות camelCase חסרות
-- ============================================================================

-- SystemSettings - camelCase columns
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "dualNoticeMode" BOOLEAN DEFAULT false;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "pauseAllSessionAdvance" BOOLEAN DEFAULT false;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "screenProfile" TEXT DEFAULT '50';
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "groupRotationSeconds" INTEGER DEFAULT 8;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "noticeRotationSeconds" INTEGER DEFAULT 20;
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

-- DaySchedule - camelCase columns
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
ALTER TABLE "DaySchedule" ADD COLUMN IF NOT EXISTS "dutyPerson" TEXT;

-- Notice - camelCase columns
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "isFullScreen" BOOLEAN DEFAULT false;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "displaySeconds" INTEGER;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "targetDate" DATE;
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "layout" TEXT DEFAULT 'single';

-- טריגר לסנכרון נתונים בין snake_case ל-camelCase (אופציונלי)
-- זה יעתיק אוטומטית נתונים מ-snake_case ל-camelCase בכל UPDATE
