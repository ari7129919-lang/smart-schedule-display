-- ============================================================================
-- טריגרים לסנכרון camelCase ↔ snake_case
-- ============================================================================

-- 1. DaySchedule - סנכרון dayOfWeek ↔ day_of_week
CREATE OR REPLACE FUNCTION sync_dayschedule_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync camelCase to snake_case
  IF NEW."dayOfWeek" IS NOT NULL THEN
    NEW.day_of_week := NEW."dayOfWeek";
  ELSIF NEW.day_of_week IS NOT NULL THEN
    NEW."dayOfWeek" := NEW.day_of_week;
  END IF;
  
  IF NEW."weekStartDate" IS NOT NULL THEN
    NEW.week_start_date := NEW."weekStartDate";
  ELSIF NEW.week_start_date IS NOT NULL THEN
    NEW."weekStartDate" := NEW.week_start_date;
  END IF;
  
  IF NEW."pauseAllSessionAdvance" IS NOT NULL THEN
    NEW.pause_all_session_advance := NEW."pauseAllSessionAdvance";
  ELSIF NEW.pause_all_session_advance IS NOT NULL THEN
    NEW."pauseAllSessionAdvance" := NEW.pause_all_session_advance;
  END IF;
  
  IF NEW."allCircleMembers" IS NOT NULL THEN
    NEW.all_circle_members := NEW."allCircleMembers";
  ELSIF NEW.all_circle_members IS NOT NULL THEN
    NEW."allCircleMembers" := NEW.all_circle_members;
  END IF;
  
  IF NEW."internalCircleLists" IS NOT NULL THEN
    NEW.internal_circle_lists := NEW."internalCircleLists";
  ELSIF NEW.internal_circle_lists IS NOT NULL THEN
    NEW."internalCircleLists" := NEW.internal_circle_lists;
  END IF;
  
  IF NEW."circleDisplayMode" IS NOT NULL THEN
    NEW.circle_display_mode := NEW."circleDisplayMode";
  ELSIF NEW.circle_display_mode IS NOT NULL THEN
    NEW."circleDisplayMode" := NEW.circle_display_mode;
  END IF;
  
  IF NEW."smallGroups" IS NOT NULL THEN
    NEW.small_groups := NEW."smallGroups";
  ELSIF NEW.small_groups IS NOT NULL THEN
    NEW."smallGroups" := NEW.small_groups;
  END IF;
  
  IF NEW."workshops" IS NOT NULL THEN
    NEW.workshops := NEW."workshops";
  ELSIF NEW.workshops IS NOT NULL THEN
    NEW."workshops" := NEW.workshops;
  END IF;
  
  IF NEW."congratulations" IS NOT NULL THEN
    NEW.congratulations := NEW."congratulations";
  ELSIF NEW.congratulations IS NOT NULL THEN
    NEW."congratulations" := NEW.congratulations;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_dayschedule_trigger ON "DaySchedule";
CREATE TRIGGER sync_dayschedule_trigger
  BEFORE INSERT OR UPDATE ON "DaySchedule"
  FOR EACH ROW EXECUTE FUNCTION sync_dayschedule_columns();

-- 2. SystemSettings - סנכרון
CREATE OR REPLACE FUNCTION sync_systemsettings_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."dualNoticeMode" IS NOT NULL THEN NEW.dual_notice_mode := NEW."dualNoticeMode"; ELSIF NEW.dual_notice_mode IS NOT NULL THEN NEW."dualNoticeMode" := NEW.dual_notice_mode; END IF;
  IF NEW."pauseAllSessionAdvance" IS NOT NULL THEN NEW.pause_all_session_advance := NEW."pauseAllSessionAdvance"; ELSIF NEW.pause_all_session_advance IS NOT NULL THEN NEW."pauseAllSessionAdvance" := NEW.pause_all_session_advance; END IF;
  IF NEW."screenProfile" IS NOT NULL THEN NEW.screen_profile := NEW."screenProfile"; ELSIF NEW.screen_profile IS NOT NULL THEN NEW."screenProfile" := NEW.screen_profile; END IF;
  IF NEW."groupRotationSeconds" IS NOT NULL THEN NEW.group_rotation_seconds := NEW."groupRotationSeconds"; ELSIF NEW.group_rotation_seconds IS NOT NULL THEN NEW."groupRotationSeconds" := NEW.group_rotation_seconds; END IF;
  IF NEW."noticeRotationSeconds" IS NOT NULL THEN NEW.notice_rotation_seconds := NEW."noticeRotationSeconds"; ELSIF NEW.notice_rotation_seconds IS NOT NULL THEN NEW."noticeRotationSeconds" := NEW.notice_rotation_seconds; END IF;
  IF NEW."timerTitle" IS NOT NULL THEN NEW.timer_title := NEW."timerTitle"; ELSIF NEW.timer_title IS NOT NULL THEN NEW."timerTitle" := NEW.timer_title; END IF;
  IF NEW."timerFullScreenMinutes" IS NOT NULL THEN NEW.timer_full_screen_minutes := NEW."timerFullScreenMinutes"; ELSIF NEW.timer_full_screen_minutes IS NOT NULL THEN NEW."timerFullScreenMinutes" := NEW.timer_full_screen_minutes; END IF;
  IF NEW."overrideMode" IS NOT NULL THEN NEW.override_mode := NEW."overrideMode"; ELSIF NEW.override_mode IS NOT NULL THEN NEW."overrideMode" := NEW.override_mode; END IF;
  IF NEW."overrideDay" IS NOT NULL THEN NEW.override_day := NEW."overrideDay"; ELSIF NEW.override_day IS NOT NULL THEN NEW."overrideDay" := NEW.override_day; END IF;
  IF NEW."customModeConfig" IS NOT NULL THEN NEW.custom_mode_config := NEW."customModeConfig"; ELSIF NEW.custom_mode_config IS NOT NULL THEN NEW."customModeConfig" := NEW.custom_mode_config; END IF;
  IF NEW."boardDesign" IS NOT NULL THEN NEW.board_design := NEW."boardDesign"; ELSIF NEW.board_design IS NOT NULL THEN NEW."boardDesign" := NEW.board_design; END IF;
  IF NEW."fixedRules" IS NOT NULL THEN NEW.fixed_rules := NEW."fixedRules"; ELSIF NEW.fixed_rules IS NOT NULL THEN NEW."fixedRules" := NEW.fixed_rules; END IF;
  IF NEW."tickerText" IS NOT NULL THEN NEW.ticker_text := NEW."tickerText"; ELSIF NEW.ticker_text IS NOT NULL THEN NEW."tickerText" := NEW.ticker_text; END IF;
  IF NEW."contactInfo" IS NOT NULL THEN NEW.contact_info := NEW."contactInfo"; ELSIF NEW.contact_info IS NOT NULL THEN NEW."contactInfo" := NEW.contact_info; END IF;
  IF NEW."operatingHours" IS NOT NULL THEN NEW.operating_hours := NEW."operatingHours"; ELSIF NEW.operating_hours IS NOT NULL THEN NEW."operatingHours" := NEW.operating_hours; END IF;
  IF NEW."backgroundRotationEnabled" IS NOT NULL THEN NEW.background_rotation_enabled := NEW."backgroundRotationEnabled"; ELSIF NEW.background_rotation_enabled IS NOT NULL THEN NEW."backgroundRotationEnabled" := NEW.background_rotation_enabled; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_systemsettings_trigger ON "SystemSettings";
CREATE TRIGGER sync_systemsettings_trigger
  BEFORE INSERT OR UPDATE ON "SystemSettings"
  FOR EACH ROW EXECUTE FUNCTION sync_systemsettings_columns();

-- 3. Notice - סנכרון
CREATE OR REPLACE FUNCTION sync_notice_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."pdfUrl" IS NOT NULL THEN NEW.pdf_url := NEW."pdfUrl"; ELSIF NEW.pdf_url IS NOT NULL THEN NEW."pdfUrl" := NEW.pdf_url; END IF;
  IF NEW."imageUrl" IS NOT NULL THEN NEW.image_url := NEW."imageUrl"; ELSIF NEW.image_url IS NOT NULL THEN NEW."imageUrl" := NEW.image_url; END IF;
  IF NEW."isFullScreen" IS NOT NULL THEN NEW.is_full_screen := NEW."isFullScreen"; ELSIF NEW.is_full_screen IS NOT NULL THEN NEW."isFullScreen" := NEW.is_full_screen; END IF;
  IF NEW."displaySeconds" IS NOT NULL THEN NEW.display_seconds := NEW."displaySeconds"; ELSIF NEW.display_seconds IS NOT NULL THEN NEW."displaySeconds" := NEW.display_seconds; END IF;
  IF NEW."targetDate" IS NOT NULL THEN NEW.target_date := NEW."targetDate"; ELSIF NEW.target_date IS NOT NULL THEN NEW."targetDate" := NEW.target_date; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_notice_trigger ON "Notice";
CREATE TRIGGER sync_notice_trigger
  BEFORE INSERT OR UPDATE ON "Notice"
  FOR EACH ROW EXECUTE FUNCTION sync_notice_columns();

-- ============================================================================
-- הסרת NOT NULL constraint אם קיים (ליתר בטחון)
-- ============================================================================
ALTER TABLE "DaySchedule" ALTER COLUMN day_of_week DROP NOT NULL;
ALTER TABLE "DaySchedule" ALTER COLUMN week_start_date DROP NOT NULL;

-- ============================================================================
-- DONE!
-- ============================================================================
