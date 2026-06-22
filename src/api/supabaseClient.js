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
    
    if (table === 'SystemSettings' && data && data.length > 0) {
      console.log('Supabase find result - overrideDay:', data[0]?.overrideDay, 'override_day:', data[0]?.override_day);
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
      mapField('overrideMode', 'override_mode');
      mapField('timerTitle', 'timer_title');
      mapField('timerFullScreenMinutes', 'timer_full_screen_minutes');
      mapField('screenProfile', 'screen_profile');
      mapField('groupRotationSeconds', 'group_rotation_seconds');
      mapField('noticeRotationSeconds', 'notice_rotation_seconds');
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
    }
    
    console.log('Supabase update - table:', table, 'id:', id);
    console.log('Original data overrideDay:', data.overrideDay);
    console.log('Update data override_day:', updateData.override_day);
    
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
