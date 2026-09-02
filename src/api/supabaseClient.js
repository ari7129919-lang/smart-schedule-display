// Supabase client for production
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using local API fallback.')
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseKey || 'local'
)

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'http://localhost'
}

// Generic API wrapper that matches localAPI interface
// Helper to parse JSON fields that might be stored as strings
const parseJsonField = (value) => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    try {
      return parseJsonField(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    const isCharacterIndexedObject = keys.length > 0 && keys.every(key => /^\d+$/.test(key));
    if (isCharacterIndexedObject) {
      const serialized = keys
        .sort((a, b) => Number(a) - Number(b))
        .map(key => value[key])
        .join('');
      return parseJsonField(serialized);
    }
  }

  return value;
};

export const supabaseAPI = {
  async find(table, query = {}) {
    let qb = supabase.from(table).select('*')
    
    // Add filters from query object
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qb = qb.eq(key, value)
      }
    })
    
    const { data, error } = await qb
    if (error) throw error
    
    // Reverse snake_case → camelCase for SystemSettings
    if (table === 'SystemSettings' && data) {
      data.forEach(row => {
        if ('override_day' in row) row.overrideDay = row.override_day;
        if ('override_mode' in row) row.overrideMode = row.override_mode;
        if ('timer_title' in row) row.timerTitle = row.timer_title;
        if ('timer_full_screen_minutes' in row) row.timerFullScreenMinutes = row.timer_full_screen_minutes;
        if ('screen_profile' in row) row.screenProfile = row.screen_profile;
        if ('group_rotation_seconds' in row) row.groupRotationSeconds = row.group_rotation_seconds;
        if ('notice_rotation_seconds' in row) row.noticeRotationSeconds = row.notice_rotation_seconds;
        if ('special_notice_rotation_seconds' in row) row.specialNoticeRotationSeconds = row.special_notice_rotation_seconds;
        if ('dual_notice_mode' in row) row.dualNoticeMode = row.dual_notice_mode;
        if ('pause_all_session_advance' in row) row.pauseAllSessionAdvance = row.pause_all_session_advance;
        if ('board_design' in row) row.boardDesign = parseJsonField(row.board_design);
        if ('custom_mode_config' in row) row.customModeConfig = parseJsonField(row.custom_mode_config);
        if ('ticker_text' in row) row.tickerText = row.ticker_text;
        if ('contact_info' in row) row.contactInfo = row.contact_info;
        if ('operating_hours' in row) row.operatingHours = row.operating_hours;
        if ('fixed_rules' in row) row.fixedRules = parseJsonField(row.fixed_rules);
        if ('background_rotation_enabled' in row) row.backgroundRotationEnabled = row.background_rotation_enabled;
        if ('ticker_enabled' in row) row.tickerEnabled = row.ticker_enabled;
        if ('popup_config' in row) row.popupConfig = parseJsonField(row.popup_config);
        if ('calendar_enabled' in row) row.calendarEnabled = row.calendar_enabled;
        if ('calendar_rotation_minutes' in row) row.calendarRotationMinutes = row.calendar_rotation_minutes;
        if ('calendar_duration_seconds' in row) row.calendarDurationSeconds = row.calendar_duration_seconds;
        if ('calendar_cell_rotation_seconds' in row) row.calendarCellRotationSeconds = row.calendar_cell_rotation_seconds;
        if ('upcoming_event_enabled' in row) row.upcomingEventEnabled = row.upcoming_event_enabled;
        if ('upcoming_event_rotation_seconds' in row) row.upcomingEventRotationSeconds = row.upcoming_event_rotation_seconds;
      });
      if (data.length > 0) {
        console.log('[find] popupConfig after parse:', data[0].popupConfig);
      }
    }

    return data || []
  },

  async get(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Reverse snake_case → camelCase for SystemSettings
    if (table === 'SystemSettings' && data) {
      if ('override_day' in data) data.overrideDay = data.override_day;
      if ('override_mode' in data) data.overrideMode = data.override_mode;
      if ('timer_title' in data) data.timerTitle = data.timer_title;
      if ('timer_full_screen_minutes' in data) data.timerFullScreenMinutes = data.timer_full_screen_minutes;
      if ('screen_profile' in data) data.screenProfile = data.screen_profile;
      if ('group_rotation_seconds' in data) data.groupRotationSeconds = data.group_rotation_seconds;
      if ('notice_rotation_seconds' in data) data.noticeRotationSeconds = data.notice_rotation_seconds;
      if ('special_notice_rotation_seconds' in data) data.specialNoticeRotationSeconds = data.special_notice_rotation_seconds;
      if ('dual_notice_mode' in data) data.dualNoticeMode = data.dual_notice_mode;
      if ('pause_all_session_advance' in data) data.pauseAllSessionAdvance = data.pause_all_session_advance;
      if ('board_design' in data) data.boardDesign = data.board_design;
      if ('custom_mode_config' in data) data.customModeConfig = data.custom_mode_config;
      if ('ticker_text' in data) data.tickerText = data.ticker_text;
      if ('contact_info' in data) data.contactInfo = data.contact_info;
      if ('operating_hours' in data) data.operatingHours = data.operating_hours;
      if ('fixed_rules' in data) data.fixedRules = parseJsonField(data.fixed_rules);
      if ('background_rotation_enabled' in data) data.backgroundRotationEnabled = data.background_rotation_enabled;
      if ('ticker_enabled' in data) data.tickerEnabled = data.ticker_enabled;
      if ('popup_config' in data) data.popupConfig = parseJsonField(data.popup_config);
      if ('calendar_enabled' in data) data.calendarEnabled = data.calendar_enabled;
      if ('calendar_rotation_minutes' in data) data.calendarRotationMinutes = data.calendar_rotation_minutes;
      if ('calendar_duration_seconds' in data) data.calendarDurationSeconds = data.calendar_duration_seconds;
      if ('calendar_cell_rotation_seconds' in data) data.calendarCellRotationSeconds = data.calendar_cell_rotation_seconds;
      if ('upcoming_event_enabled' in data) data.upcomingEventEnabled = data.upcoming_event_enabled;
      if ('upcoming_event_rotation_seconds' in data) data.upcomingEventRotationSeconds = data.upcoming_event_rotation_seconds;
    }

    return data
  },

  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async update(table, id, data) {
    // Prepare data with snake_case equivalents for Supabase triggers
    const updateData = { ...data };
    
    // Map camelCase to snake_case for SystemSettings fields
    if (table === 'SystemSettings') {
      const mapField = (camel, snake) => {
        if (camel in data) {
          updateData[snake] = data[camel];
          delete updateData[camel];
        }
      };
      mapField('overrideDay', 'override_day');
      if ('overrideDay' in data) {
        updateData.override_day = data.overrideDay;
        updateData.overrideDay = data.overrideDay;
      }
      mapField('overrideMode', 'override_mode');
      mapField('timerTitle', 'timer_title');
      mapField('timerFullScreenMinutes', 'timer_full_screen_minutes');
      mapField('screenProfile', 'screen_profile');
      mapField('groupRotationSeconds', 'group_rotation_seconds');
      mapField('noticeRotationSeconds', 'notice_rotation_seconds');
      mapField('specialNoticeRotationSeconds', 'special_notice_rotation_seconds');
      mapField('dualNoticeMode', 'dual_notice_mode');
      mapField('pauseAllSessionAdvance', 'pause_all_session_advance');
      mapField('boardDesign', 'board_design');
      mapField('customModeConfig', 'custom_mode_config');
      mapField('tickerText', 'ticker_text');
      mapField('contactInfo', 'contact_info');
      mapField('operatingHours', 'operating_hours');
      mapField('fixedRules', 'fixed_rules');
      mapField('backgroundRotationEnabled', 'background_rotation_enabled');
      mapField('tickerEnabled', 'ticker_enabled');
      mapField('popupConfig', 'popup_config');
      mapField('calendarEnabled', 'calendar_enabled');
      mapField('calendarRotationMinutes', 'calendar_rotation_minutes');
      mapField('calendarDurationSeconds', 'calendar_duration_seconds');
      mapField('calendarCellRotationSeconds', 'calendar_cell_rotation_seconds');
      mapField('upcomingEventEnabled', 'upcoming_event_enabled');
      mapField('upcomingEventRotationSeconds', 'upcoming_event_rotation_seconds');

      ['board_design', 'custom_mode_config', 'fixed_rules', 'popup_config'].forEach(field => {
        if (field in updateData) {
          updateData[field] = parseJsonField(updateData[field]);
        }
      });
    }
    
    console.log('Supabase update - table:', table, 'id:', id);
    console.log('Original data popupConfig:', data.popupConfig);
    console.log('Update data popup_config:', updateData.popup_config);
    
    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log('Supabase result overrideDay:', result?.overrideDay, 'override_day:', result?.override_day);
    return result
  },

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { message: 'Deleted' }
  },

  async upload(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return { url: publicUrl, filename: fileName }
  }
}
