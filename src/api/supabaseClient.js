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
    return data || []
  },

  async get(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
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
      if ('overrideDay' in data) updateData.override_day = data.overrideDay;
      if ('overrideMode' in data) updateData.override_mode = data.overrideMode;
      if ('timerTitle' in data) updateData.timer_title = data.timerTitle;
      if ('timerFullScreenMinutes' in data) updateData.timer_full_screen_minutes = data.timerFullScreenMinutes;
      if ('screenProfile' in data) updateData.screen_profile = data.screenProfile;
      if ('groupRotationSeconds' in data) updateData.group_rotation_seconds = data.groupRotationSeconds;
      if ('noticeRotationSeconds' in data) updateData.notice_rotation_seconds = data.noticeRotationSeconds;
      if ('dualNoticeMode' in data) updateData.dual_notice_mode = data.dualNoticeMode;
      if ('pauseAllSessionAdvance' in data) updateData.pause_all_session_advance = data.pauseAllSessionAdvance;
      if ('boardDesign' in data) updateData.board_design = data.boardDesign;
      if ('customModeConfig' in data) updateData.custom_mode_config = data.customModeConfig;
      if ('tickerText' in data) updateData.ticker_text = data.tickerText;
      if ('contactInfo' in data) updateData.contact_info = data.contactInfo;
      if ('operatingHours' in data) updateData.operating_hours = data.operatingHours;
      if ('fixedRules' in data) updateData.fixed_rules = data.fixedRules;
      if ('backgroundRotationEnabled' in data) updateData.background_rotation_enabled = data.backgroundRotationEnabled;
    }
    
    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
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
