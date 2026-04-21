import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Image, Monitor, ChevronUp, ChevronDown } from 'lucide-react';

const FIT_OPTIONS = [
  { value: 'cover', label: 'כיסוי מלא' },
  { value: 'contain', label: 'התאמה מלאה' },
  { value: 'stretch', label: 'מתיחה' },
  { value: 'center', label: 'מרכוז' },
];

function BackgroundItem({ bg, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange({ ...bg, imageUrl: file_url, type: 'image' });
    setUploading(false);
  };

  return (
    <Card className={`border-2 transition-colors ${bg.active !== false ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
      {/* Item Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* Order buttons */}
          <div className="flex flex-col">
            <button onClick={onMoveUp} disabled={isFirst} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <Input
            value={bg.name || ''}
            onChange={e => onChange({ ...bg, name: e.target.value })}
            placeholder="שם הרקע"
            className="w-44 h-8 text-sm font-medium"
          />
          <Badge variant={bg.type === 'none' ? 'secondary' : bg.type === 'image' ? 'default' : 'outline'} className="text-xs">
            {bg.type === 'none' ? '⬜ ללא רקע' : bg.type === 'image' ? '🖼️ תמונה/GIF' : '</> HTML'}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={bg.active !== false} onCheckedChange={v => onChange({ ...bg, active: v })} />
            <span className="text-xs text-gray-500">{bg.active !== false ? 'פעיל' : 'כבוי'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Type selector */}
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">סוג רקע</Label>
          <div className="flex gap-2">
            {[
              { val: 'none', label: '⬜ ללא רקע' },
              { val: 'image', label: '🖼️ תמונה / GIF' },
              { val: 'html', label: '</> HTML' },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange({ ...bg, type: opt.val })}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  bg.type === opt.val
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image settings */}
        {bg.type === 'image' && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">קובץ / URL</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={bg.imageUrl || ''}
                onChange={e => onChange({ ...bg, imageUrl: e.target.value })}
                placeholder="הדבק URL של תמונה או GIF..."
                dir="ltr"
                className="flex-1 text-sm bg-white"
              />
              <label className="cursor-pointer shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-md text-sm font-medium whitespace-nowrap transition-colors shadow-sm">
                  {uploading ? '⏳ מעלה...' : '📎 העלה קובץ'}
                </span>
                <input type="file" accept="image/*,.gif,.webp,.svg" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            {bg.imageUrl && (
              <div className="relative w-full h-24 rounded-lg overflow-hidden border bg-gray-200">
                <img src={bg.imageUrl} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">תצוגה מקדימה</div>
              </div>
            )}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">התאמה למסך 60"</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {FIT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...bg, fitMode: opt.value })}
                    className={`py-1.5 px-2 rounded border text-xs font-medium transition-all ${
                      (bg.fitMode || 'cover') === opt.value
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HTML settings */}
        {bg.type === 'html' && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">קוד HTML</Label>
            <Textarea
              value={bg.htmlContent || ''}
              onChange={e => onChange({ ...bg, htmlContent: e.target.value })}
              placeholder={'<div style="background: linear-gradient(135deg, #667eea, #764ba2); width:100%; height:100%;"></div>'}
              className="font-mono text-xs h-32 bg-white"
              dir="ltr"
            />
            <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
              ⚠️ הקוד ירוץ ב-iframe מבודד. תומך ב-JS, CSS, video, canvas, iframe.
            </p>
          </div>
        )}

        {/* Display mode + opacity + duration */}
        {bg.type !== 'none' && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg border-t">
            {/* Display mode */}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">מצב הצגה</Label>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...bg, displayMode: 'full' })}
                  className={`py-2 text-xs rounded-lg border font-medium transition-all ${
                    (bg.displayMode || 'full') === 'full'
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🖥️ רקע מלא
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...bg, displayMode: 'watermark' })}
                  className={`py-2 text-xs rounded-lg border font-medium transition-all ${
                    bg.displayMode === 'watermark'
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  💧 סימן מים
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                שקיפות: {Math.round((bg.opacity ?? (bg.displayMode === 'watermark' ? 0.25 : 1)) * 100)}%
              </Label>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={bg.opacity ?? (bg.displayMode === 'watermark' ? 0.25 : 1)}
                onChange={e => onChange({ ...bg, opacity: parseFloat(e.target.value) })}
                className="w-full mt-3"
              />
            </div>

            {/* Duration */}
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">זמן הצגה</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="5"
                  max="3600"
                  value={bg.durationSeconds || 30}
                  onChange={e => onChange({ ...bg, durationSeconds: Number(e.target.value) })}
                  className="h-8 text-sm bg-white"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">שנ'</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BackgroundTab({ settings, onSave, isPending }) {
  const [localBgs, setLocalBgs] = useState(settings?.backgrounds || []);
  const [localRotation, setLocalRotation] = useState(settings?.backgroundRotationEnabled !== false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync from server only on first load (when settings.id appears)
  useEffect(() => {
    setLocalBgs(settings?.backgrounds || []);
    setLocalRotation(settings?.backgroundRotationEnabled !== false);
    setIsDirty(false);
  }, [settings?.id]);

  const handleBgsChange = (newBgs) => {
    setLocalBgs(newBgs);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave({ ...settings, backgrounds: localBgs, backgroundRotationEnabled: localRotation });
    setIsDirty(false);
  };

  const handleAdd = (type = 'image') => {
    const newBg = {
      id: Date.now().toString(),
      name: `רקע ${localBgs.length + 1}`,
      type,
      imageUrl: '',
      htmlContent: '',
      displayMode: 'full',
      opacity: 1,
      fitMode: 'cover',
      durationSeconds: 30,
      active: true,
    };
    handleBgsChange([...localBgs, newBg]);
  };

  const handleChange = (idx, updated) => {
    const newBgs = [...localBgs];
    newBgs[idx] = updated;
    handleBgsChange(newBgs);
  };

  const handleDelete = (idx) => handleBgsChange(localBgs.filter((_, i) => i !== idx));

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newBgs = [...localBgs];
    [newBgs[idx - 1], newBgs[idx]] = [newBgs[idx], newBgs[idx - 1]];
    handleBgsChange(newBgs);
  };

  const handleMoveDown = (idx) => {
    if (idx === localBgs.length - 1) return;
    const newBgs = [...localBgs];
    [newBgs[idx + 1], newBgs[idx]] = [newBgs[idx], newBgs[idx + 1]];
    handleBgsChange(newBgs);
  };

  const activeCount = localBgs.filter(b => b.active !== false && b.type !== 'none').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            ניהול רקעים
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rotation toggle */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${localRotation ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <Switch
              checked={localRotation}
              onCheckedChange={v => { setLocalRotation(v); setIsDirty(true); }}
            />
            <div>
              <Label className="font-semibold text-gray-800">החלפת רקעים אוטומטית</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                {localRotation
                  ? `המערכת תחליף אוטומטית בין ${activeCount} רקעים פעילים לפי הזמן שהוגדר`
                  : 'יוצג רק הרקע הראשון הפעיל ברשימה (ללא החלפה)'}
              </p>
            </div>
          </div>

          {/* Add buttons */}
          <div>
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">הוסף רקע חדש</Label>
            <div className="flex gap-2">
              <Button onClick={() => handleAdd('none')} variant="outline" size="sm" className="gap-1.5 flex-1">
                <Plus className="w-3.5 h-3.5" />
                ⬜ ללא רקע
              </Button>
              <Button onClick={() => handleAdd('image')} variant="outline" size="sm" className="gap-1.5 flex-1">
                <Plus className="w-3.5 h-3.5" />
                🖼️ תמונה / GIF
              </Button>
              <Button onClick={() => handleAdd('html')} variant="outline" size="sm" className="gap-1.5 flex-1">
                <Plus className="w-3.5 h-3.5" />
                {"</>"} HTML
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {localBgs.length === 0 && (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Monitor className="w-14 h-14 mx-auto mb-3 opacity-25" />
          <p className="font-medium text-gray-500">אין רקעים מוגדרים</p>
          <p className="text-sm mt-1">המסך יוצג עם הרקע הרגיל שלו</p>
          <p className="text-xs mt-2 text-gray-400">לחץ על אחד מהכפתורים למעלה כדי להוסיף רקע</p>
        </div>
      )}

      {/* Background items */}
      {localBgs.map((bg, idx) => (
        <BackgroundItem
          key={bg.id || idx}
          bg={bg}
          onChange={(updated) => handleChange(idx, updated)}
          onDelete={() => handleDelete(idx)}
          onMoveUp={() => handleMoveUp(idx)}
          onMoveDown={() => handleMoveDown(idx)}
          isFirst={idx === 0}
          isLast={idx === localBgs.length - 1}
        />
      ))}

      {/* Bottom save button */}
      {localBgs.length > 0 && (
        <div className="flex justify-end pt-2 border-t">
          <Button
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="gap-2 bg-blue-600 hover:bg-blue-700 px-8"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'שומר...' : isDirty ? 'שמור שינויים' : 'שמור'}
          </Button>
        </div>
      )}
    </div>
  );
}