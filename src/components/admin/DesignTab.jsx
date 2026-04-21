import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Palette, Monitor, Type } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Background Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
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

      {/* Primary Color */}
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

      {/* Layout */}
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
            <Label className="font-medium">גודל גופן מודעות (כותרת + תוכן) — ברירת מחדל: 1.0</Label>
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

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isPending} className="gap-2">
          <Save className="w-4 h-4" />
          שמור עיצוב
        </Button>
      </div>
    </div>
  );
}