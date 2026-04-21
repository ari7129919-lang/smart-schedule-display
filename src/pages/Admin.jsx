import React, { useState, useEffect } from 'react';
import { localAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Calendar, FileText, Users, Clock, Play, 
  Plus, Trash2, Save, Eye, RefreshCw, Monitor, Timer, ExternalLink, Phone,
  Palette, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CustomModePanel from '@/components/display/CustomModePanel';
import RichTextEditor from '@/components/admin/RichTextEditor';
import DesignTab from '@/components/admin/DesignTab';
import SpecialActivitiesTab from '@/components/admin/SpecialActivitiesTab';
import DisplayPreviewModal from '@/components/admin/DisplayPreviewModal';
import BackgroundTab from '@/components/admin/BackgroundTab';

function ActiveTimerDisplay() {
  const [timerEnd, setTimerEnd] = useState(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const checkTimer = () => {
      const stored = localStorage.getItem('display_timer_end');
      if (stored) {
        const endTime = parseInt(stored);
        const now = Date.now();
        if (endTime > now) {
          setTimerEnd(endTime);
          setRemaining(Math.ceil((endTime - now) / 1000));
        } else {
          localStorage.removeItem('display_timer_end');
          setTimerEnd(null);
          setRemaining(0);
        }
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerEnd) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const rem = Math.ceil((timerEnd - now) / 1000);
      if (rem <= 0) {
        setTimerEnd(null);
        setRemaining(0);
        localStorage.removeItem('display_timer_end');
      } else {
        setRemaining(rem);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnd]);

  const stopTimer = () => {
    localStorage.removeItem('display_timer_end');
    localStorage.setItem('display_timer_stop', Date.now().toString());
    setTimerEnd(null);
    setRemaining(0);
  };

  if (!timerEnd) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <Timer className="w-6 h-6 text-blue-600 animate-pulse" />
        <div>
          <div className="text-sm text-blue-600">טיימר פעיל</div>
          <div className="text-2xl font-bold text-blue-800">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>
      <Button onClick={stopTimer} variant="destructive" size="sm">
        עצור
      </Button>
    </div>
  );
}

const dayNames = {
  sunday: 'ראשון',
  monday: 'שני',
  tuesday: 'שלישי',
  wednesday: 'רביעי',
  thursday: 'חמישי',
  saturday: 'מוצ"ש'
};

const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];

export default function Admin() {
  const [activeDay, setActiveDay] = useState('sunday');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingSettings, setEditingSettings] = useState(null);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: daySchedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['daySchedules'],
    queryFn: () => localAPI.find('DaySchedule')
  });

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => localAPI.find('Notice')
  });

  const { data: settings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => localAPI.find('SystemSettings')
  });

  const { data: phoneNumbers = [], isLoading: loadingPhoneNumbers } = useQuery({
    queryKey: ['phoneNumbers'],
    queryFn: () => localAPI.find('PhoneNumbers')
  });

  const savePhoneMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return localAPI.update('PhoneNumbers', data.id, data);
      return localAPI.create('PhoneNumbers', data);
    },
    onSuccess: () => queryClient.invalidateQueries(['phoneNumbers'])
  });

  const deletePhoneMutation = useMutation({
    mutationFn: (id) => localAPI.delete('PhoneNumbers', id),
    onSuccess: () => queryClient.invalidateQueries(['phoneNumbers'])
  });

  const systemSettings = settings[0] || {};

  useEffect(() => {
    const currentSchedule = daySchedules.find(d => d.dayOfWeek === activeDay);
    setEditingSchedule(currentSchedule || { dayOfWeek: activeDay });
  }, [activeDay, daySchedules]);

  useEffect(() => {
    setEditingSettings(systemSettings);
  }, [settings]);

  const saveScheduleMutation = useMutation({
    mutationFn: async (data) => {
      const existing = daySchedules.find(d => d.dayOfWeek === data.dayOfWeek);
      if (existing) {
        return localAPI.update('DaySchedule', existing.id, data);
      }
      return localAPI.create('DaySchedule', data);
    },
    onSuccess: () => queryClient.invalidateQueries(['daySchedules'])
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (systemSettings.id) {
        return localAPI.update('SystemSettings', systemSettings.id, data);
      }
      return localAPI.create('SystemSettings', data);
    },
    onSuccess: () => queryClient.invalidateQueries(['settings'])
  });

  const saveNoticeMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) {
        return localAPI.update('Notice', data.id, data);
      }
      return localAPI.create('Notice', data);
    },
    onSuccess: () => queryClient.invalidateQueries(['notices'])
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (id) => localAPI.delete('Notice', id),
    onSuccess: () => queryClient.invalidateQueries(['notices'])
  });

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      saveScheduleMutation.mutate(editingSchedule);
    }
  };

  const handleSaveSettings = () => {
    if (editingSettings) {
      saveSettingsMutation.mutate(editingSettings);
    }
  };

  const handleRefreshDisplay = () => {
    // Use localStorage for cross-tab communication
    localStorage.setItem('display_refresh', Date.now().toString());
  };

  const handleStartTimer = (minutes) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('display_timer', minutes.toString());
    localStorage.setItem('display_timer_end', endTime.toString());
  };

  const handleStartWorkshop = () => {
    if (!editingSchedule?.workshops?.length) return;
    
    // Auto-advance: calculate session based on weekStartDate
    const weekStart = editingSchedule.weekStartDate ? new Date(editingSchedule.weekStartDate) : null;
    const now = new Date();
    
    // Check global pause or day-level pause
    if (systemSettings.pauseAllSessionAdvance || editingSchedule.pauseAllSessionAdvance) {
      alert('המיספור מושהה כרגע. כדי להתקדם, בטל את ההשהיה בהגדרות.');
      return;
    }

    const updatedWorkshops = editingSchedule.workshops.map(w => {
      // If session advancement is paused for this workshop, skip
      if (w.pauseSessionAdvance) return w;
      
      let newSession = w.currentSession || 1;
      
      if (weekStart) {
        // Calculate how many weeks have passed since weekStartDate
        const msSinceStart = now - weekStart;
        const weeksPassed = Math.floor(msSinceStart / (7 * 24 * 60 * 60 * 1000));
        const baseSession = w.baseSession || 1;
        newSession = Math.min(baseSession + weeksPassed, w.totalSessions || 12);
      } else {
        newSession = Math.min((w.currentSession || 0) + 1, w.totalSessions || 12);
      }
      
      return { ...w, currentSession: newSession };
    });
    
    const updatedSchedule = { ...editingSchedule, workshops: updatedWorkshops };
    setEditingSchedule(updatedSchedule);
    saveScheduleMutation.mutate(updatedSchedule);
  };

  const handleCustomModeConfig = (config) => {
    const updatedSettings = {
      ...editingSettings,
      overrideMode: 'custom',
      customModeConfig: config
    };
    setEditingSettings(updatedSettings);
    saveSettingsMutation.mutate(updatedSettings);
  };

  const addWorkshop = () => {
    setEditingSchedule(prev => ({
      ...prev,
      workshops: [...(prev.workshops || []), {
        name: '',
        startTime: '',
        endTime: '',
        totalSessions: 12,
        currentSession: 1,
        kickoffEnabled: true
      }]
    }));
  };

  const updateWorkshop = (index, field, value) => {
    setEditingSchedule(prev => {
      const workshops = [...(prev.workshops || [])];
      workshops[index] = { ...workshops[index], [field]: value };
      return { ...prev, workshops };
    });
  };

  const removeWorkshop = (index) => {
    setEditingSchedule(prev => ({
      ...prev,
      workshops: prev.workshops.filter((_, i) => i !== index)
    }));
  };

  const addSmallGroup = () => {
    setEditingSchedule(prev => ({
      ...prev,
      smallGroups: [...(prev.smallGroups || []), { name: '', members: [] }]
    }));
  };

  const addCongrats = () => {
    setEditingSchedule(prev => ({
      ...prev,
      congratulations: [...(prev.congratulations || []), { name: '', message: '' }]
    }));
  };

  const addRule = () => {
    setEditingSettings(prev => ({
      ...prev,
      fixedRules: [...(prev.fixedRules || []), '']
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {showCustomPanel && (
        <CustomModePanel
          config={editingSettings?.customModeConfig || {}}
          onSave={handleCustomModeConfig}
          onClose={() => setShowCustomPanel(false)}
        />
      )}
      <DisplayPreviewModal open={showPreview} onClose={() => setShowPreview(false)} />

      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">ניהול לוח מודעות</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowPreview(true)} variant="outline" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
              <Monitor className="w-4 h-4" />
              תצוגה מקדימה
            </Button>
            <Button onClick={handleRefreshDisplay} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              רענן תצוגה
            </Button>
            <Link to={createPageUrl('Display')} target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                פתח תצוגה
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="days" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="days" className="gap-2">
              <Calendar className="w-4 h-4" />
              ניהול ימים
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-2">
              <FileText className="w-4 h-4" />
              מודעות
            </TabsTrigger>
            <TabsTrigger value="phones" className="gap-2">
              <Phone className="w-4 h-4" />
              מספרים נחוצים
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              הגדרות מערכת
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              עיצוב לוח
            </TabsTrigger>
            <TabsTrigger value="special" className="gap-2">
              <Star className="w-4 h-4" />
              פעילויות מיוחדות
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="gap-2">
              <Monitor className="w-4 h-4" />
              רקעים
            </TabsTrigger>
          </TabsList>

          {/* Days Management */}
          <TabsContent value="days" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  בחר יום
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dayOrder.map(day => (
                    <Button
                      key={day}
                      variant={activeDay === day ? 'default' : 'outline'}
                      onClick={() => setActiveDay(day)}
                    >
                      {dayNames[day]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {editingSchedule && (
              <>
                {/* Workshops */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      סדנאות - יום {dayNames[activeDay]}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={handleStartWorkshop} variant="outline" className="gap-2">
                        <Play className="w-4 h-4" />
                        עדכן מפגש נוכחי
                      </Button>
                      <Button onClick={addWorkshop} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        הוסף סדנא
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingSchedule.workshops?.map((workshop, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">סדנא {idx + 1}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeWorkshop(idx)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>שם הסדנא</Label>
                            <Input
                              value={workshop.name || ''}
                              onChange={e => updateWorkshop(idx, 'name', e.target.value)}
                              placeholder="שם הסדנא"
                            />
                          </div>
                          <div>
                            <Label>שעת התחלה</Label>
                            <Input
                              type="time"
                              value={workshop.startTime || ''}
                              onChange={e => updateWorkshop(idx, 'startTime', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>שעת סיום</Label>
                            <Input
                              type="time"
                              value={workshop.endTime || ''}
                              onChange={e => updateWorkshop(idx, 'endTime', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>מפגש נוכחי (מתוך 12)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={workshop.currentSession || 1}
                              onChange={e => updateWorkshop(idx, 'currentSession', Number(e.target.value))}
                            />
                            {/* Show auto-calculated session based on weekStartDate */}
                            {(() => {
                              const weekStart = editingSchedule.weekStartDate ? new Date(editingSchedule.weekStartDate) : null;
                              const globalPause = systemSettings.pauseAllSessionAdvance;
                              const dayPause = editingSchedule.pauseAllSessionAdvance;
                              if (!weekStart || globalPause || dayPause || workshop.pauseSessionAdvance) return null;
                              const now = new Date();
                              const msSinceStart = now - weekStart;
                              if (msSinceStart < 0) return null;
                              const weeksPassed = Math.floor(msSinceStart / (7 * 24 * 60 * 60 * 1000));
                              const base = workshop.baseSession || workshop.currentSession || 1;
                              const auto = Math.min(base + weeksPassed, workshop.totalSessions || 12);
                              return (
                                <p className="text-xs text-blue-600 mt-1 font-medium">
                                  📺 מוצג בתצוגה: מפגש {auto}
                                </p>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Switch
                              checked={workshop.kickoffEnabled}
                              onCheckedChange={v => updateWorkshop(idx, 'kickoffEnabled', v)}
                            />
                            <Label>הפעל Kickoff</Label>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Switch
                              checked={workshop.hideSmallGroups !== true}
                              onCheckedChange={v => updateWorkshop(idx, 'hideSmallGroups', !v)}
                            />
                            <Label>הצג קבוצות קטנות</Label>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Switch
                               checked={workshop.hideInternalCircle !== true}
                              onCheckedChange={v => updateWorkshop(idx, 'hideInternalCircle', !v)}
                            />
                            <Label>הצג מעגל פנימי</Label>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Switch
                              checked={workshop.pauseSessionAdvance === true}
                              onCheckedChange={v => updateWorkshop(idx, 'pauseSessionAdvance', v)}
                            />
                            <Label className="text-orange-600 font-medium">⏸ השהה מיספור מפגשים</Label>
                          </div>
                          <div>
                            <Label>מפגש בסיס (למיספור אוטומטי)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={workshop.baseSession || workshop.currentSession || 1}
                              onChange={e => updateWorkshop(idx, 'baseSession', Number(e.target.value))}
                              placeholder="מפגש התחלתי"
                            />
                            <p className="text-xs text-gray-400 mt-1">המפגש שממנו מתחיל המיספור (בשבוע הראשון)</p>
                          </div>
                          </div>
                          </div>
                          ))}
                          {(!editingSchedule.workshops || editingSchedule.workshops.length === 0) && (
                      <p className="text-gray-500 text-center py-8">אין סדנאות מוגדרות ליום זה</p>
                    )}
                  </CardContent>
                </Card>

                {/* Week settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      הגדרות מיספור מפגשים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>תאריך תחילת מחזור (שבוע ראשון)</Label>
                        <Input
                          type="date"
                          value={editingSchedule.weekStartDate || ''}
                          onChange={e => setEditingSchedule({...editingSchedule, weekStartDate: e.target.value})}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          המערכת תחשב אוטומטית את מספר השבועות שעברו ותעלה את המפגש בהתאם
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Switch
                        checked={editingSchedule.pauseAllSessionAdvance === true}
                        onCheckedChange={v => setEditingSchedule({...editingSchedule, pauseAllSessionAdvance: v})}
                      />
                      <div>
                        <Label className="text-orange-700 font-medium">⏸ השהה את כל המיספורים ליום זה</Label>
                        <p className="text-xs text-orange-500 mt-0.5">שימושי בשבוע חופש — המיספור לא יעלה לאף סדנא ביום זה</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Duty Person */}
                <Card>
                  <CardHeader>
                    <CardTitle>אחראי שותפים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={editingSchedule.dutyPerson || ''}
                      onChange={e => setEditingSchedule({...editingSchedule, dutyPerson: e.target.value})}
                      placeholder="שם האחראי"
                    />
                  </CardContent>
                </Card>

                {/* Internal Circle Lists - Auto Division */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle>מעגל פנימי - חלוקה אוטומטית</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingSchedule.hideInternalCircle !== true}
                          onCheckedChange={v => setEditingSchedule({...editingSchedule, hideInternalCircle: !v})}
                        />
                        <Label className="text-sm text-gray-500">הצג בתצוגה</Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>כל חברי המעגל (הכנס את כולם - המערכת תחלק אוטומטית ל-3 קבוצות)</Label>
                      <Textarea
                        className="mt-1 h-28"
                        value={(editingSchedule.allCircleMembers || []).join(', ')}
                        onChange={e => {
                          const all = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          // Auto-split into 3 roughly equal groups
                          const total = all.length;
                          const base = Math.floor(total / 3);
                          const extra = total % 3;
                          const g1 = all.slice(0, base + (extra > 0 ? 1 : 0));
                          const g2 = all.slice(g1.length, g1.length + base + (extra > 1 ? 1 : 0));
                          const g3 = all.slice(g1.length + g2.length);
                          setEditingSchedule({
                            ...editingSchedule,
                            allCircleMembers: all,
                            internalCircleLists: [g1, g2, g3]
                          });
                        }}
                        placeholder="שמות מופרדים בפסיקים: ראובן, שמעון, לוי, יהודה..."
                      />
                      {(editingSchedule.allCircleMembers?.length > 0) && (
                        <p className="text-sm text-green-600 mt-1">
                          סה"כ {editingSchedule.allCircleMembers.length} אנשים — מחולק ל: {(editingSchedule.internalCircleLists || []).map(l => l.length).join(' / ')}
                        </p>
                      )}
                    </div>
                    <div className="border-t pt-3">
                      <Label className="font-medium">אופן הצגת המעגל בתצוגה</Label>
                      <div className="flex gap-3 mt-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setEditingSchedule({...editingSchedule, circleDisplayMode: 'all'})}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            (editingSchedule.circleDisplayMode || 'all') === 'all'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          📜 גלילת כל השמות
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSchedule({...editingSchedule, circleDisplayMode: 'range_only'})}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            editingSchedule.circleDisplayMode === 'range_only'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          🔤 שם ראשון ואחרון בלבד
                        </button>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">קבוצות שנוצרו אוטומטית (ניתן לערוך ידנית):</p>
                      {[0, 1, 2].map(listIdx => (
                        <div key={listIdx} className="mb-2">
                          <Label className="text-xs">קבוצה {listIdx + 1} ({(editingSchedule.internalCircleLists?.[listIdx] || []).length} אנשים)</Label>
                          <Textarea
                            className="h-16 text-sm"
                            value={(editingSchedule.internalCircleLists?.[listIdx] || []).join(', ')}
                            onChange={e => {
                              const lists = [...(editingSchedule.internalCircleLists || [[], [], []])];
                              lists[listIdx] = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingSchedule({...editingSchedule, internalCircleLists: lists});
                            }}
                            placeholder="שמות מופרדים בפסיקים"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Small Groups */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle>קבוצות קטנות</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingSchedule.hideSmallGroups !== true}
                          onCheckedChange={v => setEditingSchedule({...editingSchedule, hideSmallGroups: !v})}
                        />
                        <Label className="text-sm text-gray-500">הצג בתצוגה</Label>
                      </div>
                    </div>
                    <Button onClick={addSmallGroup} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      הוסף קבוצה
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingSchedule.smallGroups?.map((group, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={group.name || ''}
                            onChange={e => {
                              const groups = [...editingSchedule.smallGroups];
                              groups[idx] = { ...groups[idx], name: e.target.value };
                              setEditingSchedule({...editingSchedule, smallGroups: groups});
                            }}
                            placeholder="שם הקבוצה"
                            className="flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingSchedule({
                                ...editingSchedule,
                                smallGroups: editingSchedule.smallGroups.filter((_, i) => i !== idx)
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <Textarea
                          value={(group.members || []).join(', ')}
                          onChange={e => {
                            const groups = [...editingSchedule.smallGroups];
                            groups[idx] = { 
                              ...groups[idx], 
                              members: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            };
                            setEditingSchedule({...editingSchedule, smallGroups: groups});
                          }}
                          placeholder="חברי קבוצה מופרדים בפסיקים"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Congratulations */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>מזל טוב</CardTitle>
                    <Button onClick={addCongrats} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      הוסף
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingSchedule.congratulations?.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Input
                          value={item.name || ''}
                          onChange={e => {
                            const congrats = [...editingSchedule.congratulations];
                            congrats[idx] = { ...congrats[idx], name: e.target.value };
                            setEditingSchedule({...editingSchedule, congratulations: congrats});
                          }}
                          placeholder="שם"
                          className="w-1/3"
                        />
                        <Input
                          value={item.message || ''}
                          onChange={e => {
                            const congrats = [...editingSchedule.congratulations];
                            congrats[idx] = { ...congrats[idx], message: e.target.value };
                            setEditingSchedule({...editingSchedule, congratulations: congrats});
                          }}
                          placeholder="הודעה (אופציונלי)"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingSchedule({
                              ...editingSchedule,
                              congratulations: editingSchedule.congratulations.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSchedule}
                    disabled={saveScheduleMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    שמור הגדרות יום {dayNames[activeDay]}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Notices */}
          <TabsContent value="notices" className="space-y-6">
            <NoticesManager 
              notices={notices}
              onSave={saveNoticeMutation.mutate}
              onDelete={deleteNoticeMutation.mutate}
            />
          </TabsContent>

          {/* Phone Numbers */}
          <TabsContent value="phones" className="space-y-6">
            <PhoneNumbersManager
              phones={phoneNumbers}
              onSave={savePhoneMutation.mutate}
              onDelete={deletePhoneMutation.mutate}
            />
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            {editingSettings && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      הגדרות תצוגה
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <Switch
                        checked={editingSettings.dualNoticeMode || false}
                        onCheckedChange={v => setEditingSettings({...editingSettings, dualNoticeMode: v})}
                      />
                      <div>
                        <Label className="font-medium">הצג שתי מודעות בו זמנית</Label>
                        <p className="text-sm text-gray-500 mt-0.5">שתי מודעות יוצגו זה לצד זה בעמודת המרכז</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Switch
                        checked={editingSettings.pauseAllSessionAdvance === true}
                        onCheckedChange={v => setEditingSettings({...editingSettings, pauseAllSessionAdvance: v})}
                      />
                      <div>
                        <Label className="text-orange-700 font-medium">⏸ השהה את כל המיספורים בכל הימים (שבוע חופש)</Label>
                        <p className="text-sm text-orange-500 mt-0.5">כשמופעל — המיספור לא יתקדם אוטומטית באף יום עד שתכבה זאת</p>
                      </div>
                    </div>
                    <div>
                      <Label>פרופיל מסך</Label>
                      <Select
                        value={editingSettings.screenProfile || '50'}
                        onValueChange={v => setEditingSettings({...editingSettings, screenProfile: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14">14 אינץ' (לפטופ)</SelectItem>
                          <SelectItem value="32">32 אינץ'</SelectItem>
                          <SelectItem value="50">50 אינץ'</SelectItem>
                          <SelectItem value="60">60 אינץ' (מסך גדול)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>החלפת קבוצה (שניות)</Label>
                        <Input
                          type="number"
                          value={editingSettings.groupRotationSeconds || 8}
                          onChange={e => setEditingSettings({...editingSettings, groupRotationSeconds: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>החלפת מודעה (שניות)</Label>
                        <Input
                          type="number"
                          value={editingSettings.noticeRotationSeconds || 20}
                          onChange={e => setEditingSettings({...editingSettings, noticeRotationSeconds: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      טיימרים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ActiveTimerDisplay />
                    <div>
                      <Label>כותרת הטיימר (תופיע מעל הספירה)</Label>
                      <Input
                        value={editingSettings.timerTitle || ''}
                        onChange={e => setEditingSettings({...editingSettings, timerTitle: e.target.value})}
                        placeholder="לדוגמה: הפסקה, זמן לסיכום..."
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => handleStartTimer(5)} variant="outline">
                        5 דקות
                      </Button>
                      <Button onClick={() => handleStartTimer(10)} variant="outline">
                        10 דקות
                      </Button>
                      <Button onClick={() => handleStartTimer(15)} variant="outline">
                        15 דקות
                      </Button>
                      <Button onClick={() => handleStartTimer(20)} variant="outline">
                        20 דקות
                      </Button>
                      <Button onClick={() => handleStartTimer(30)} variant="outline">
                        30 דקות
                      </Button>
                    </div>
                    {/* Custom timer */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Label className="whitespace-nowrap">זמן מותאם אישית:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="דקות"
                        className="w-24"
                        id="custom-timer-minutes"
                      />
                      <Button
                        variant="default"
                        onClick={() => {
                          const val = parseInt(document.getElementById('custom-timer-minutes').value);
                          if (val > 0) handleStartTimer(val);
                        }}
                      >
                        הפעל
                      </Button>
                    </div>
                    <div className="pt-2 border-t">
                      <Label>הצגת טיימר על כל המסך — כמה דקות לפני הסוף (ברירת מחדל: 3)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={editingSettings.timerFullScreenMinutes ?? 3}
                          onChange={e => setEditingSettings({...editingSettings, timerFullScreenMinutes: Number(e.target.value)})}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-500">דקות לפני הסוף</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      💡 קיצורי מקשים בתצוגה: <kbd className="bg-gray-100 px-1 rounded">PageUp</kbd> = 10 דק  <kbd className="bg-gray-100 px-1 rounded">PageDown</kbd> = 15 דק  <kbd className="bg-gray-100 px-1 rounded">Tab</kbd> = ביטול
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Override ידני</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>מצב תצוגה</Label>
                      <div className="flex gap-2">
                        <Select
                          value={editingSettings.overrideMode || 'none'}
                          onValueChange={v => {
                            if (v === 'custom') {
                              setShowCustomPanel(true);
                            } else {
                              setEditingSettings({...editingSettings, overrideMode: v});
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">אוטומטי</SelectItem>
                            <SelectItem value="kickoff">מצב התחלה</SelectItem>
                            <SelectItem value="break">הפסקה</SelectItem>
                            <SelectItem value="motzei">מוצאי שבת</SelectItem>
                            <SelectItem value="custom">מותאם אישית...</SelectItem>
                          </SelectContent>
                        </Select>
                        {editingSettings.overrideMode === 'custom' && (
                          <Button variant="outline" onClick={() => setShowCustomPanel(true)}>
                            ערוך התאמה
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Override יום</Label>
                      <Select
                        value={editingSettings.overrideDay || ''}
                        onValueChange={v => setEditingSettings({...editingSettings, overrideDay: v || null})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ללא (יום נוכחי)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>ללא (יום נוכחי)</SelectItem>
                          {dayOrder.map(day => (
                            <SelectItem key={day} value={day}>{dayNames[day]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>טיקר תחתון</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>טקסט טיקר</Label>
                      <Textarea
                        value={editingSettings.tickerText || ''}
                        onChange={e => setEditingSettings({...editingSettings, tickerText: e.target.value})}
                        placeholder="טקסט שירוץ בתחתית המסך"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        💡 טיפ: לכתוב <code className="bg-gray-100 px-1 rounded">**טקסט מודגש**</code> כדי להדגיש מידע חשוב (יופיע לבן בהיר, שאר הטקסט אפור)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>פרטי קשר</Label>
                        <Input
                          value={editingSettings.contactInfo || ''}
                          onChange={e => setEditingSettings({...editingSettings, contactInfo: e.target.value})}
                          placeholder="072-2351290"
                        />
                      </div>
                      <div>
                        <Label>שעות פעילות</Label>
                        <Input
                          value={editingSettings.operatingHours || ''}
                          onChange={e => setEditingSettings({...editingSettings, operatingHours: e.target.value})}
                          placeholder="ראשון-חמישי"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>כללים קבועים</CardTitle>
                    <Button onClick={addRule} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      הוסף כלל
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(editingSettings.fixedRules || []).map((rule, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={rule}
                          onChange={e => {
                            const rules = [...(editingSettings.fixedRules || [])];
                            rules[idx] = e.target.value;
                            setEditingSettings({...editingSettings, fixedRules: rules});
                          }}
                          placeholder="כלל..."
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingSettings({
                              ...editingSettings,
                              fixedRules: editingSettings.fixedRules.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    {(!editingSettings.fixedRules || editingSettings.fixedRules.length === 0) && (
                      <p className="text-gray-500 text-center py-4">אין כללים מוגדרים</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saveSettingsMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    שמור הגדרות מערכת
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          {editingSettings && (
            <DesignTab
              settings={editingSettings}
              onChange={setEditingSettings}
              onSave={handleSaveSettings}
              isPending={saveSettingsMutation.isPending}
            />
          )}
        </TabsContent>

        {/* Special Activities Tab */}
        <TabsContent value="special" className="space-y-6">
          {editingSettings && (
            <SpecialActivitiesTab
              settings={editingSettings}
              onSave={(updatedSettings) => {
                setEditingSettings(updatedSettings);
                saveSettingsMutation.mutate(updatedSettings);
              }}
              isPending={saveSettingsMutation.isPending}
            />
          )}
        </TabsContent>

        {/* Backgrounds Tab */}
        <TabsContent value="backgrounds" className="space-y-6">
          {editingSettings && (
            <BackgroundTab
              settings={editingSettings}
              onSave={(updatedSettings) => {
                setEditingSettings(updatedSettings);
                saveSettingsMutation.mutate(updatedSettings);
              }}
              isPending={saveSettingsMutation.isPending}
            />
          )}
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PhoneNumbersManager({ phones, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);

  const handleNew = () => setEditing({ label: '', number: '', category: 'כללי', active: true, priority: phones.length + 1 });

  const handleSave = () => {
    if (editing) { onSave(editing); setEditing(null); }
  };

  const categories = ['כללי', 'מוקד שירות', 'קו תוכן', 'חירום', 'אחר'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            מספרים נחוצים
          </CardTitle>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            הוסף מספר
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phones.map(phone => (
              <div key={phone.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Badge variant={phone.active ? 'default' : 'secondary'}>{phone.active ? 'פעיל' : 'כבוי'}</Badge>
                  {phone.category && <Badge variant="outline">{phone.category}</Badge>}
                  <div>
                    <h4 className="font-medium">{phone.label}</h4>
                    <p className="text-sm text-gray-500 font-mono" dir="ltr">{phone.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(phone)}>ערוך</Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(phone.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {phones.length === 0 && <p className="text-center text-gray-500 py-8">אין מספרים</p>}
          </div>
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader><CardTitle>{editing.id ? 'עריכת מספר' : 'מספר חדש'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>תיאור / שם הקו</Label>
                <Input value={editing.label || ''} onChange={e => setEditing({...editing, label: e.target.value})} placeholder="לדוגמה: מוקד לקוחות" />
              </div>
              <div>
                <Label>מספר טלפון</Label>
                <Input value={editing.number || ''} onChange={e => setEditing({...editing, number: e.target.value})} placeholder="072-2351290" dir="ltr" />
              </div>
              <div>
                <Label>קטגוריה</Label>
                <Select value={editing.category || 'כללי'} onValueChange={v => setEditing({...editing, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>סדר עדיפות</Label>
                <Input type="number" value={editing.priority || 1} onChange={e => setEditing({...editing, priority: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.active} onCheckedChange={v => setEditing({...editing, active: v})} />
              <Label>פעיל</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing(null)}>ביטול</Button>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />שמור</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NoticesManager({ notices, onSave, onDelete }) {
  const [editingNotice, setEditingNotice] = useState(null);

  const handleNew = () => {
    setEditingNotice({
      title: '',
      content: '',
      active: true,
      days: [],
      priority: notices.length + 1
    });
  };

  const handleSave = () => {
    if (editingNotice) {
      onSave(editingNotice);
      setEditingNotice(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            מודעות
          </CardTitle>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            מודעה חדשה
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notices.map(notice => (
              <div 
                key={notice.id}
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Quick active toggle */}
                  <button
                    onClick={() => onSave({ ...notice, active: !notice.active })}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      notice.active 
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
                        : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                    }`}
                    title={notice.active ? 'לחץ להסתיר' : 'לחץ להציג'}
                  >
                    {notice.active ? '● פעיל' : '○ כבוי'}
                  </button>
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{notice.title}</h4>
                    {notice.days?.length > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        ימים: {notice.days.map(d => dayNames[d]).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingNotice(notice)}
                  >
                    ערוך
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(notice.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-center text-gray-500 py-8">אין מודעות</p>
            )}
          </div>
        </CardContent>
      </Card>

      {editingNotice && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNotice.id ? 'עריכת מודעה' : 'מודעה חדשה'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={editingNotice.title || ''}
                onChange={e => setEditingNotice({...editingNotice, title: e.target.value})}
              />
            </div>
            <div>
              <Label>תוכן המודעה</Label>
              <RichTextEditor
                value={editingNotice.content || ''}
                onChange={v => setEditingNotice({...editingNotice, content: v})}
                placeholder="תוכן המודעה..."
              />
            </div>
            <div>
              <Label>קובץ PDF (לחלופין במקום טקסט)</Label>
              <div className="flex gap-2 mt-1 items-center">
                <Input
                  value={editingNotice.pdfUrl || ''}
                  onChange={e => setEditingNotice({...editingNotice, pdfUrl: e.target.value})}
                  placeholder="הדבק URL של PDF..."
                  dir="ltr"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm whitespace-nowrap transition-colors">
                    📎 העלה PDF
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { url: file_url } = await localAPI.upload(file);
                      setEditingNotice({...editingNotice, pdfUrl: file_url});
                    }}
                  />
                </label>
              </div>
              {editingNotice.pdfUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-green-600">✅ PDF מחובר</span>
                  <button onClick={() => setEditingNotice({...editingNotice, pdfUrl: ''})} className="text-red-400 text-sm hover:text-red-600">הסר</button>
                </div>
              )}
            </div>
            <div>
              <Label>תמונה (לחלופין / בנוסף לטקסט)</Label>
              <div className="flex gap-2 mt-1 items-center">
                <Input
                  value={editingNotice.imageUrl || ''}
                  onChange={e => setEditingNotice({...editingNotice, imageUrl: e.target.value})}
                  placeholder="הדבק URL של תמונה..."
                  dir="ltr"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm whitespace-nowrap transition-colors">
                    🖼️ העלה תמונה
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { url: file_url } = await localAPI.upload(file);
                      setEditingNotice({...editingNotice, imageUrl: file_url});
                    }}
                  />
                </label>
              </div>
              {editingNotice.imageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={editingNotice.imageUrl} alt="" className="h-16 rounded object-cover border" />
                  <button onClick={() => setEditingNotice({...editingNotice, imageUrl: ''})} className="text-red-400 text-sm hover:text-red-600">הסר</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>תאריך יעד (לספירה לאחור)</Label>
                <Input
                  type="date"
                  value={editingNotice.targetDate || ''}
                  onChange={e => setEditingNotice({...editingNotice, targetDate: e.target.value})}
                />
              </div>
              <div>
                <Label>זמן הצגה (שניות) — ריק = ברירת מחדל מערכת</Label>
                <Input
                  type="number"
                  min="3"
                  max="300"
                  value={editingNotice.displaySeconds || ''}
                  onChange={e => setEditingNotice({...editingNotice, displaySeconds: e.target.value ? Number(e.target.value) : null})}
                  placeholder="לדוגמה: 30"
                />
              </div>
            </div>
            <div>
              <Label>ימים להצגה (ריק = כל הימים)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dayOrder.map(day => (
                  <Badge
                    key={day}
                    variant={(editingNotice.days || []).includes(day) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const days = editingNotice.days || [];
                      if (days.includes(day)) {
                        setEditingNotice({...editingNotice, days: days.filter(d => d !== day)});
                      } else {
                        setEditingNotice({...editingNotice, days: [...days, day]});
                      }
                    }}
                  >
                    {dayNames[day]}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingNotice.active}
                onCheckedChange={v => setEditingNotice({...editingNotice, active: v})}
              />
              <Label>מודעה פעילה</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingNotice.isFullScreen}
                onCheckedChange={v => setEditingNotice({...editingNotice, isFullScreen: v})}
              />
              <Label>הצג על כל המסך</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingNotice(null)}>
                ביטול
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                שמור
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}