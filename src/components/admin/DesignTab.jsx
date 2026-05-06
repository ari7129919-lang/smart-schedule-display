import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Palette, Monitor, Type, LayoutGrid, Paintbrush, Users, Zap } from 'lucide-react';

const BG_PRESETS = [
  { label: 'כחול-אפור (ברירת מחדל)', value: '#F2F4F7' },
  { label: 'לבן', value: '#FFFFFF' },
  { label: 'שמנת חם', value: '#FAF8F4' },
  { label: 'כחול בהיר', value: '#EBF0FA' },
  { label: 'ירוק בהיר', value: '#EDF7F0' },
  { label: 'כהה (לילה)', value: '#1A2035' },
];

const PRIMARY_PRESETS = [
  { label: 'כחול (ברירת מחדל)', value: '#2F4580' },
  { label: 'כחול-אפור', value: '#2F3E55' },
  { label: 'ירוק כהה', value: '#2D6A4F' },
  { label: 'כחול כהה', value: '#1B2A4A' },
  { label: 'חום', value: '#5C3D2E' },
  { label: 'לבן (למסך כהה)', value: '#FFFFFF' },
];

function ColorSwatch({ label, value, selected, onClick }) {
  const isDark = value === '#1A2035' || value === '#1B2A4A' || value === '#5C3D2E';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-right ${selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200'}`}
    >
      <div 
        className="w-7 h-7 rounded-full border flex-shrink-0" 
        style={{ backgroundColor: value, borderColor: isDark ? '#888' : '#ccc' }} 
      />
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function DesignTab({ settings, onChange, onSave, isPending }) {
  const design = settings.boardDesign || {};

  const update = (key, value) => onChange({ ...settings, boardDesign: { ...design, [key]: value } });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="bg-white shadow-sm flex-wrap h-auto">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="w-4 h-4" />
            צבעים
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Type className="w-4 h-4" />
            טיפוגרפיה
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            פריסה
          </TabsTrigger>
          <TabsTrigger value="circle" className="gap-2">
            <Users className="w-4 h-4" />
            מעגל פנימי
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="w-5 h-5" />
                צבע רקע הלוח
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {BG_PRESETS.map(p => (
                  <ColorSwatch key={p.value} {...p} selected={design.bgColor === p.value} onClick={() => update('bgColor', p.value)} />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t">
                <Label className="whitespace-nowrap">צבע מותאם:</Label>
                <input
                  type="color"
                  value={design.bgColor || '#F2F4F7'}
                  onChange={e => update('bgColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  value={design.bgColor || ''}
                  onChange={e => update('bgColor', e.target.value)}
                  placeholder="#F2F4F7"
                  className="w-32 font-mono"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>צבע ראשי (כותרות, כפתורים, פסים)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {PRIMARY_PRESETS.map(p => (
                  <ColorSwatch key={p.value} {...p} selected={design.primaryColor === p.value} onClick={() => update('primaryColor', p.value)} />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t">
                <Label className="whitespace-nowrap">צבע מותאם:</Label>
                <input
                  type="color"
                  value={design.primaryColor || '#2F4580'}
                  onChange={e => update('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  value={design.primaryColor || ''}
                  onChange={e => update('primaryColor', e.target.value)}
                  placeholder="#2F4580"
                  className="w-32 font-mono"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                גדלי גופנים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="font-medium">גודל כותרת מודעה — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.noticeFontScale) || 1.0}
                    onChange={e => update('noticeFontScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.noticeFontScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">גודל תוכן המודעה — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.noticeContentScale) || 1.0}
                    onChange={e => update('noticeContentScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.noticeContentScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">גודל שעה ותאריך (כותרת עליונה) — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.clockFontScale) || 1.0}
                    onChange={e => update('clockFontScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.clockFontScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">גודל שם הסדנה (כותרת עליונה) — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.headerTitleScale) || 1.0}
                    onChange={e => update('headerTitleScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.headerTitleScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">גודל טקסט בלוקים (מעגל, קבוצות, כללים...) — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.blockTextScale) || 1.0}
                    onChange={e => update('blockTextScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.blockTextScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">גודל גופן טיקר תחתון — ברירת מחדל: 1.0</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="0.4" max="2.5" step="0.05"
                    value={parseFloat(design.tickerFontScale) || 1.0}
                    onChange={e => update('tickerFontScale', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    ×{(parseFloat(design.tickerFontScale) || 1.0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Circle Tab */}
        <TabsContent value="circle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                הדגשה ואנימציה — מצב "טווח בלבד"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="font-medium">צבע רקע הדגשה (ראשון + אחרון)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={design.circleHighlightBg || '#8FAE9B'}
                    onChange={e => update('circleHighlightBg', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={design.circleHighlightBg || ''}
                    onChange={e => update('circleHighlightBg', e.target.value)}
                    placeholder="#8FAE9B"
                    className="w-32 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">צבע טקסט הדגשה</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={design.circleHighlightText || '#1B2A4A'}
                    onChange={e => update('circleHighlightText', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={design.circleHighlightText || ''}
                    onChange={e => update('circleHighlightText', e.target.value)}
                    placeholder="#1B2A4A"
                    className="w-32 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">סוג אנימציה</Label>
                <div className="flex gap-3 mt-2">
                  {[
                    { label: 'דופק', value: 'pulse' },
                    { label: 'זוהר', value: 'glow' },
                    { label: 'קפיצה', value: 'bounce' },
                    { label: 'ללא', value: 'none' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('circleAnimationType', opt.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        (design.circleAnimationType || 'pulse') === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">מהירות אנימציה</Label>
                <div className="flex gap-3 mt-2">
                  {[
                    { label: 'איטי', value: 'slow' },
                    { label: 'רגיל', value: 'normal' },
                    { label: 'מהיר', value: 'fast' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('circleAnimationSpeed', opt.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        (design.circleAnimationSpeed || 'normal') === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">
                  ההדגשה תופיע רק במצב <strong>"שם ראשון ואחרון בלבד"</strong> של המעגל הפנימי בלוח התצוגה.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                פריסת הלוח
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="font-medium">רוחב עמודות הצד (מעגל פנימי / כללים) — ברירת מחדל: 20%</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="12" max="32" step="1"
                    value={parseInt(design.sideColumnWidth) || 20}
                    onChange={e => update('sideColumnWidth', e.target.value)}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    {design.sideColumnWidth || 20}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">עמודת מרכז (מודעות) תגדל/תקטן בהתאם</p>
              </div>

              <div className="border-t pt-4">
                <Label className="font-medium">שקיפות כרטיסי מודעות (%) — ברירת מחדל: 88</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min="50" max="100" step="1"
                    value={parseInt(design.cardOpacity) || 88}
                    onChange={e => update('cardOpacity', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold w-14 text-center text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    {design.cardOpacity || 88}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isPending} className="gap-2">
          <Save className="w-4 h-4" />
          שמור עיצוב
        </Button>
      </div>
    </div>
  );
}