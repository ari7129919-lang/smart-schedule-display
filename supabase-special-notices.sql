-- הודעות מיוחדות: להרצה ב-Supabase בפרויקט קיים
-- מריצים אחרי supabase-schema.sql / supabase-schema-alter.sql

ALTER TABLE "SystemSettings"
  ADD COLUMN IF NOT EXISTS "specialNoticeRotationSeconds" INTEGER DEFAULT 8;

ALTER TABLE "DaySchedule"
  ADD COLUMN IF NOT EXISTS "workshops" JSONB DEFAULT '[]';

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
CREATE POLICY "Allow all access" ON "SpecialNotice"
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_special_notice_active ON "SpecialNotice"(active);

DROP TRIGGER IF EXISTS update_special_notice_updated_at ON "SpecialNotice";
CREATE TRIGGER update_special_notice_updated_at
  BEFORE UPDATE ON "SpecialNotice"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
