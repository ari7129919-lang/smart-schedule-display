-- Smart Schedule Display: CalendarEvent + calendar display settings
-- Run this once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT DEFAULT '',
  color TEXT DEFAULT '#5FAFA8',
  active BOOLEAN DEFAULT true,
  "eventDate" DATE,
  "startTime" TEXT,
  "endTime" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE "CalendarEvent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON "CalendarEvent";
CREATE POLICY "Allow all access" ON "CalendarEvent"
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_calendar_event_date ON "CalendarEvent"(event_date);

ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS calendar_enabled BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS calendar_rotation_minutes INTEGER DEFAULT 5;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS calendar_duration_seconds INTEGER DEFAULT 20;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS calendar_cell_rotation_seconds INTEGER DEFAULT 6;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS upcoming_event_enabled BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS upcoming_event_rotation_seconds INTEGER DEFAULT 60;

ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "calendarEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "calendarRotationMinutes" INTEGER DEFAULT 5;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "calendarDurationSeconds" INTEGER DEFAULT 20;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "calendarCellRotationSeconds" INTEGER DEFAULT 6;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "upcomingEventEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "upcomingEventRotationSeconds" INTEGER DEFAULT 60;

CREATE OR REPLACE FUNCTION sync_calendar_event_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."eventDate" IS NOT NULL THEN NEW.event_date := NEW."eventDate"; ELSIF NEW.event_date IS NOT NULL THEN NEW."eventDate" := NEW.event_date; END IF;
  IF NEW."startTime" IS NOT NULL THEN NEW.start_time := NEW."startTime"; ELSIF NEW.start_time IS NOT NULL THEN NEW."startTime" := NEW.start_time; END IF;
  IF NEW."endTime" IS NOT NULL THEN NEW.end_time := NEW."endTime"; ELSIF NEW.end_time IS NOT NULL THEN NEW."endTime" := NEW.end_time; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_calendar_event_trigger ON "CalendarEvent";
CREATE TRIGGER sync_calendar_event_trigger
  BEFORE INSERT OR UPDATE ON "CalendarEvent"
  FOR EACH ROW EXECUTE FUNCTION sync_calendar_event_columns();

CREATE OR REPLACE FUNCTION update_calendar_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_calendar_event_updated_at ON "CalendarEvent";
CREATE TRIGGER update_calendar_event_updated_at BEFORE UPDATE ON "CalendarEvent"
  FOR EACH ROW EXECUTE FUNCTION update_calendar_event_updated_at();
