import React, { useMemo, useState } from 'react';
import { CalendarDays, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatGregorianDate, formatHebrewDate, formatEventTime } from '@/lib/calendarEvents';

const EMPTY_EVENT = {
  title: '', description: '', eventDate: '', startTime: '', endTime: '', location: '',
  color: '#5FAFA8', active: true,
};

export default function CalendarEventsManager({ events = [], onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const sortedEvents = useMemo(() => [...events].sort((a, b) => `${a.eventDate || ''}${a.startTime || ''}`.localeCompare(`${b.eventDate || ''}${b.startTime || ''}`)), [events]);

  const save = () => {
    if (!editing?.title?.trim() || !editing?.eventDate) return;
    onSave({ ...editing, title: editing.title.trim() });
    setEditing(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5" />אירועים קרובים</CardTitle>
          <Button onClick={() => setEditing({ ...EMPTY_EVENT })} className="gap-2"><Plus className="w-4 h-4" />אירוע חדש</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedEvents.map(event => (
            <div key={event.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50">
              <div className="w-3 h-12 rounded-full shrink-0" style={{ backgroundColor: event.color || '#5FAFA8' }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <strong className="text-lg">{event.title}</strong>
                  {!event.active && <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-gray-500">כבוי</span>}
                </div>
                <div className="text-sm text-gray-600">{formatGregorianDate(event.eventDate)} · {formatHebrewDate(event.eventDate)} · {formatEventTime(event)}{event.location ? ` · ${event.location}` : ''}</div>
                {event.description && <div className="mt-1 truncate text-sm text-gray-500">{event.description}</div>}
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing({ ...event })} className="gap-1"><Pencil className="w-4 h-4" />ערוך</Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} aria-label="מחק"><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          ))}
          {sortedEvents.length === 0 && <p className="py-10 text-center text-gray-500">אין אירועים. הוסף את האירוע הראשון.</p>}
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>{editing.id ? 'עריכת אירוע' : 'אירוע חדש'}</CardTitle><Button variant="ghost" size="icon" onClick={() => setEditing(null)}><X className="w-5 h-5" /></Button></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>כותרת *</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="לדוגמה: ערב הורים" /></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><Label>תאריך *</Label><Input type="date" value={editing.eventDate || ''} onChange={e => setEditing({ ...editing, eventDate: e.target.value })} /></div>
              <div><Label>שעת התחלה</Label><Input type="time" value={editing.startTime || ''} onChange={e => setEditing({ ...editing, startTime: e.target.value })} /></div>
              <div><Label>שעת סיום</Label><Input type="time" value={editing.endTime || ''} onChange={e => setEditing({ ...editing, endTime: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><Label>מיקום</Label><Input value={editing.location || ''} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="אולם / כתובת" /></div>
              <div><Label>צבע סימון</Label><div className="flex gap-2"><input type="color" value={editing.color || '#5FAFA8'} onChange={e => setEditing({ ...editing, color: e.target.value })} className="h-10 w-12 cursor-pointer rounded border" /><Input value={editing.color || '#5FAFA8'} onChange={e => setEditing({ ...editing, color: e.target.value })} dir="ltr" /></div></div>
            </div>
            <div><Label>פרטים</Label><textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="מה חשוב שהצופים ידעו?" /></div>
            <div className="flex items-center gap-3"><Switch checked={editing.active !== false} onCheckedChange={active => setEditing({ ...editing, active })} /><Label>אירוע פעיל להצגה</Label></div>
            {editing.eventDate && <p className="rounded bg-blue-50 p-3 text-sm text-blue-800">תצוגה: {formatGregorianDate(editing.eventDate)} · {formatHebrewDate(editing.eventDate)} · {formatEventTime(editing)}</p>}
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>ביטול</Button><Button onClick={save} disabled={!editing.title?.trim() || !editing.eventDate} className="gap-2"><Save className="w-4 h-4" />שמור אירוע</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
