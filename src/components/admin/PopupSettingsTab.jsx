import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Eye, Type, Palette, Timer, Image, Layout, Monitor } from 'lucide-react';

const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'ה.fade בהדרגה' },
  { value: 'zoom', label: 'זום ממרכז' },
  { value: 'slide-up', label: 'ה.slide למעלה' },
  { value: 'bounce', label: 'bounce אלסטי' },
];

const DISPLAY_MODE_OPTIONS = [
  { value: 'modal', label: 'מודאל מרכזי (עם רקע כהה)' },
  { value: 'banner', label: 'באנר עליון צף' },
];

export default function PopupSettingsTab({ settings, onChange }) {
  const popupConfig = settings?.popupConfig || {};

  // Compute days left for preview
  const computeDaysLeft = () => {
    if (!popupConfig.deadlineDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadline = new Date(popupConfig.deadlineDate);
    deadline.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
  };

  const previewDaysLeft = computeDaysLeft();
  const highlightStyle = 'display:inline-block;font-size:1.8em;font-weight:900;color:#FFD700;text-shadow:0 2px 10px rgba(0,0,0,0.6),0 0 30px rgba(255,215,0,0.4);line-height:1;vertical-align:middle;padding:0 4px;';

  const getPreviewContent = (rawContent) => {
    if (!rawContent) return '<p>תוכן ההודעה יופיע כאן...</p>';
    if (previewDaysLeft === null) return rawContent;
    return rawContent.replace(/\{daysLeft\}/g, `<span style="${highlightStyle}">${previewDaysLeft}</span>`);
  };

  const updatePopup = (key, value) => {
    onChange({
      ...settings,
      popupConfig: {
        ...popupConfig,
        [key]: value,
      },
    });
  };

  const isEnabled = popupConfig.enabled || false;
  const displayMode = popupConfig.displayMode || 'modal';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Global Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={(v) => updatePopup('enabled', v)}
            />
            <div>
              <Label className="font-medium">
                {isEnabled ? 'ההודעה הקופצת פעילה' : 'ההודעה הקופצת כבויה'}
              </Label>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEnabled
                  ? 'ההודעה תקפוץ על הלוח במרווחי הזמן שהוגדרו'
                  : 'ההודעה לא תוצג — התצוגה תמשיך כרגיל'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="bg-white shadow-sm flex-wrap h-auto">
            <TabsTrigger value="content" className="gap-2">
              <Bell className="w-4 h-4" />
              תוכן
            </TabsTrigger>
            <TabsTrigger value="timing" className="gap-2">
              <Timer className="w-4 h-4" />
              תזמון
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              עיצוב
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              תצוגה מקדימה
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  סוג תצוגה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {DISPLAY_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updatePopup('displayMode', opt.value)}
                      className={`p-4 border rounded-lg text-right transition-colors ${
                        displayMode === opt.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {opt.value === 'modal'
                          ? 'חלון מרכזי מעל כל התוכן עם רקע כהה'
                          : 'פס צף בראש המסך שלא מכסה את הלוח'}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  תוכן ההודעה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>כותרת (אופציונלי)</Label>
                  <Input
                    value={popupConfig.title || ''}
                    onChange={(e) => updatePopup('title', e.target.value)}
                    placeholder="לדוגמה: הודעה חשובה!"
                  />
                </div>
                <div>
                  <Label>תוכן ההודעה</Label>
                  <Textarea
                    value={popupConfig.content || ''}
                    onChange={(e) => updatePopup('content', e.target.value)}
                    placeholder="הקלד כאן את תוכן ההודעה..."
                    rows={5}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ניתן להשתמש בתגיות HTML בסיסיות (b, i, br) לעיצוב
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    כתובת תמונה (אופציונלי)
                  </Label>
                  <Input
                    value={popupConfig.imageUrl || ''}
                    onChange={(e) => updatePopup('imageUrl', e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    הכנס URL של תמונה שתוצג בתוך ההודעה
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <Label className="flex items-center gap-2 text-amber-700">
                      <Timer className="w-4 h-4" />
                      תאריך יעד (אופציונלי)
                    </Label>
                    <Input
                      type="date"
                      value={popupConfig.deadlineDate || ''}
                      onChange={(e) => updatePopup('deadlineDate', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      הזן תאריך לספירה לאחור
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>טיפ:</strong> השתמש ב-<code className="bg-white px-1 rounded font-mono text-amber-600">{'{daysLeft}'}</code> בתוך תוכן ההודעה — המערכת תחליף אותו אוטומטית במספר הימים שנשארו עד לתאריך היעד.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    לדוגמה: "נשארו {'{daysLeft}'} ימים עד לסגירת הרישום!"
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  הגדרות זמן
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>מרווח בין קפיצות (דקות)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={popupConfig.intervalMinutes || 5}
                      onChange={(e) => updatePopup('intervalMinutes', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      כל כמה זמן ההודעה תקפוץ שוב
                    </p>
                  </div>
                  <div>
                    <Label>משך הצגה (שניות)</Label>
                    <Input
                      type="number"
                      min={3}
                      max={300}
                      value={popupConfig.durationSeconds || 10}
                      onChange={(e) => updatePopup('durationSeconds', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      כמה שניות ההודעה תוצג בכל קפיצה
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <Monitor className="w-4 h-4 inline-block ml-1" />
                    <strong>חישון:</strong> ההודעה תקפוץ כל{' '}
                    <strong>{popupConfig.intervalMinutes || 5}</strong> דקות למשך{' '}
                    <strong>{popupConfig.durationSeconds || 10}</strong> שניות.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  עיצוב
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>גודל גופן (px)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="range"
                      min={16}
                      max={72}
                      step={1}
                      value={popupConfig.fontSize || 32}
                      onChange={(e) => updatePopup('fontSize', Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {popupConfig.fontSize || 32}px
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div>
                    <Label>צבע טקסט</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={popupConfig.textColor || '#FFFFFF'}
                        onChange={(e) => updatePopup('textColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={popupConfig.textColor || '#FFFFFF'}
                        onChange={(e) => updatePopup('textColor', e.target.value)}
                        className="w-28 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>צבע רקע</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={popupConfig.bgColor || '#1A2B4C'}
                        onChange={(e) => updatePopup('bgColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={popupConfig.bgColor || '#1A2B4C'}
                        onChange={(e) => updatePopup('bgColor', e.target.value)}
                        className="w-28 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>צבע מסגרת</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={popupConfig.borderColor || '#5FAFA8'}
                        onChange={(e) => updatePopup('borderColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={popupConfig.borderColor || '#5FAFA8'}
                        onChange={(e) => updatePopup('borderColor', e.target.value)}
                        className="w-28 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label>סוג אנימציה</Label>
                  <Select
                    value={popupConfig.animation || 'zoom'}
                    onValueChange={(v) => updatePopup('animation', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANIMATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  תצוגה מקדימה
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayMode === 'modal' ? (
                  <div
                    className="relative flex items-center justify-center rounded-lg overflow-hidden"
                    style={{ minHeight: '300px', backgroundColor: 'rgba(0,0,0,0.65)' }}
                  >
                    <div
                      className="rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center space-y-4"
                      style={{
                        backgroundColor: popupConfig.bgColor || '#1A2B4C',
                        border: `3px solid ${popupConfig.borderColor || '#5FAFA8'}`,
                      }}
                    >
                      {(popupConfig.title || 'כותרת לדוגמה') && (
                        <h2
                          className="font-bold"
                          style={{
                            fontSize: `${(popupConfig.fontSize || 32) * 1.3}px`,
                            color: popupConfig.textColor || '#FFFFFF',
                          }}
                        >
                          {popupConfig.title || 'כותרת לדוגמה'}
                        </h2>
                      )}
                      {popupConfig.imageUrl && (
                        <img
                          src={popupConfig.imageUrl}
                          alt="Preview"
                          className="rounded-lg object-contain max-h-32 mx-auto"
                        />
                      )}
                      <div
                        style={{
                          fontSize: `${popupConfig.fontSize || 32}px`,
                          color: popupConfig.textColor || '#FFFFFF',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: getPreviewContent(popupConfig.content),
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-lg shadow-xl p-4"
                    style={{
                      backgroundColor: popupConfig.bgColor || '#1A2B4C',
                      borderBottom: `4px solid ${popupConfig.borderColor || '#5FAFA8'}`,
                    }}
                  >
                    <div className="flex items-center gap-4" dir="rtl">
                      {popupConfig.imageUrl && (
                        <img
                          src={popupConfig.imageUrl}
                          alt="Preview"
                          className="rounded object-contain flex-shrink-0"
                          style={{ height: '48px', width: 'auto' }}
                        />
                      )}
                      <div className="flex-1">
                        {(popupConfig.title || 'כותרת לדוגמה') && (
                          <div
                            className="font-bold mb-1"
                            style={{
                              fontSize: `${(popupConfig.fontSize || 32) * 0.85}px`,
                              color: popupConfig.textColor || '#FFFFFF',
                            }}
                          >
                            {popupConfig.title || 'כותרת לדוגמה'}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: `${popupConfig.fontSize || 32}px`,
                            color: popupConfig.textColor || '#FFFFFF',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: getPreviewContent(popupConfig.content),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

    </div>
  );
}
