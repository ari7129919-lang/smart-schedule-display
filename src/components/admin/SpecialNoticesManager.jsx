import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Pencil, Save } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

const emptyNotice = (priority) => ({
  title: '',
  content: '',
  active: true,
  archived: false,
  priority,
});

export default function SpecialNoticesManager({ notices = [], rotationSeconds = 8, onSave, onDelete, onSaveSettings }) {
  const [editingNotice, setEditingNotice] = useState(null);
  const [draftRotation, setDraftRotation] = useState(rotationSeconds);

  const sortedNotices = [...notices].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  const saveNotice = () => {
    if (!editingNotice?.title?.trim()) {
      alert('יש להזין כותרת להודעה');
      return;
    }
    onSave({ ...editingNotice, title: editingNotice.title.trim() });
    setEditingNotice(null);
  };

  const saveRotation = () => {
    const value = Math.max(1, Number(draftRotation) || 8);
    setDraftRotation(value);
    onSaveSettings(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            הודעות מיוחדות
          </CardTitle>
          <Button onClick={() => setEditingNotice(emptyNotice(sortedNotices.length + 1))} className="gap-2">
            <Plus className="w-4 h-4" />
            הודעה חדשה
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 rounded-lg border bg-blue-50/50 p-4">
            <div className="w-48">
              <Label>זמן החלפה ברירת מחדל (שניות)</Label>
              <Input
                type="number"
                min="1"
                value={draftRotation}
                onChange={e => setDraftRotation(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={saveRotation} className="gap-2">
              <Save className="w-4 h-4" />
              שמור זמן רוטציה
            </Button>
            <p className="text-sm text-gray-600">ניתן להגדיר זמן שונה לכל הודעה בעת עריכתה.</p>
          </div>

          {sortedNotices.map(notice => (
            <div key={notice.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-gray-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${notice.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {notice.active ? 'פעיל' : 'כבוי'}
                  </span>
                  <h3 className="truncate font-semibold" dangerouslySetInnerHTML={{ __html: notice.title || 'ללא כותרת' }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">החלפה: {notice.displaySeconds || rotationSeconds} שניות</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingNotice({ ...notice })} className="gap-1">
                  <Pencil className="w-3.5 h-3.5" />
                  ערוך
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(notice.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {sortedNotices.length === 0 && <p className="py-8 text-center text-gray-500">אין הודעות מיוחדות. הוסף הודעה ראשונה.</p>}
        </CardContent>
      </Card>

      <Dialog open={!!editingNotice} onOpenChange={open => !open && setEditingNotice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingNotice?.id ? 'עריכת הודעה מיוחדת' : 'הודעה מיוחדת חדשה'}</DialogTitle></DialogHeader>
          {editingNotice && (
            <div className="space-y-5 py-4">
              <div>
                <Label>כותרת מעוצבת</Label>
                <RichTextEditor
                  value={editingNotice.title}
                  onChange={value => setEditingNotice(prev => ({ ...prev, title: value }))}
                  placeholder="כותרת ההודעה..."
                />
              </div>
              <div>
                <Label>תוכן מעוצב</Label>
                <RichTextEditor
                  value={editingNotice.content}
                  onChange={value => setEditingNotice(prev => ({ ...prev, content: value }))}
                  placeholder="תוכן ההודעה..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>זמן החלפה להודעה (שניות)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingNotice.displaySeconds || ''}
                    onChange={e => setEditingNotice(prev => ({ ...prev, displaySeconds: Number(e.target.value) || null }))}
                    placeholder={`ברירת מחדל: ${rotationSeconds}`}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editingNotice.active !== false} onCheckedChange={active => setEditingNotice(prev => ({ ...prev, active }))} />
                  <Label>הודעה פעילה</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotice(null)}>ביטול</Button>
            <Button onClick={saveNotice} className="gap-2"><Save className="w-4 h-4" />שמור הודעה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
