import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock3 } from 'lucide-react';
import { getCalendarDays, getEventsForDate, formatGregorianDate, formatHebrewDate, formatEventTime, formatWeekday } from '@/lib/calendarEvents';

const DAY_HEADERS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function CalendarCell({ dateKey, events, isToday, upcomingEvent, screenScale, rotationSeconds }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    if (events.length <= 1) return undefined;
    const interval = setInterval(() => setIndex(current => (current + 1) % events.length), rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [dateKey, events.length, rotationSeconds]);

  const event = events[index];
  const isUpcoming = event && upcomingEvent?.id === event.id;
  const date = new Date(`${dateKey}T12:00:00Z`);
  const dayNumber = date.getUTCDate();
  return (
    <div className={`min-h-0 overflow-hidden rounded-xl border-2 p-3 ${isToday ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-white'} ${isUpcoming ? 'ring-4 ring-emerald-500' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-left leading-tight">
          <div className="font-black text-emerald-800" style={{ fontSize: `${22 * screenScale}px` }}>{formatHebrewDate(dateKey)}</div>
          <div className="font-bold text-slate-500" style={{ fontSize: `${14 * screenScale}px` }}>{formatWeekday(dateKey)}</div>
        </div>
        <div className="font-black text-slate-800" style={{ fontSize: `${30 * screenScale}px` }}>{dayNumber}</div>
      </div>
      {event ? (
        <motion.div key={event.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 border-t-2 pt-1" style={{ borderColor: event.color || '#5FAFA8' }}>
          <div className="font-black leading-tight text-slate-900" style={{ fontSize: `${20 * screenScale}px` }}>{event.title}</div>
          <div className="flex items-center gap-1 font-black text-slate-800" style={{ fontSize: `${17 * screenScale}px` }}><Clock3 size={16 * screenScale} />{formatEventTime(event)}</div>
          {event.location && <div className="flex items-center gap-1 font-semibold text-slate-700" style={{ fontSize: `${15 * screenScale}px` }}><MapPin size={14 * screenScale} />{event.location}</div>}
          {event.description && <div className="line-clamp-2 font-medium text-slate-700" style={{ fontSize: `${14 * screenScale}px` }}>{event.description}</div>}
          {events.length > 1 && <div className="mt-1 text-xs font-bold text-slate-400">{index + 1}/{events.length}</div>}
        </motion.div>
      ) : <div className="mt-3 text-slate-300" style={{ fontSize: `${12 * screenScale}px` }}>אין אירועים</div>}
    </div>
  );
}

export default function CalendarDisplay({ events = [], screenScale = 1, rotationSeconds = 6, upcomingEvent }) {
  const days = useMemo(() => getCalendarDays(), []);
  const today = days[0];
  const grouped = useMemo(() => Object.fromEntries(days.map(day => [day, getEventsForDate(events, day)])), [days, events]);
  const firstWeekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const cells = [...Array(firstWeekday).fill(null), ...days];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="absolute inset-0 z-40 flex flex-col overflow-hidden rounded-3xl bg-slate-100 p-4" dir="rtl">
      <div className="mb-2 flex items-center justify-between border-b-2 border-slate-300 pb-2">
        <div className="flex items-center gap-3"><CalendarDays size={34 * screenScale} className="text-emerald-700" /><div><h2 className="font-black text-slate-800" style={{ fontSize: `${30 * screenScale}px` }}>האירועים הקרובים</h2><div className="text-slate-500" style={{ fontSize: `${15 * screenScale}px` }}>30 הימים הקרובים · {formatGregorianDate(today)}</div></div></div>
        <div className="rounded-lg bg-white px-3 py-2 text-left text-slate-600" style={{ fontSize: `${13 * screenScale}px` }}>תאריך עברי ולועזי</div>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">{DAY_HEADERS.map(day => <div key={day} className="rounded-lg bg-slate-800 py-1 text-center font-black text-white" style={{ fontSize: `${20 * screenScale}px` }}>{day}</div>)}</div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-2">{cells.map((day, index) => day ? <CalendarCell key={day} dateKey={day} events={grouped[day]} isToday={day === today} upcomingEvent={upcomingEvent} screenScale={screenScale} rotationSeconds={rotationSeconds} /> : <div key={`empty-${index}`} />)}</div>
    </motion.div>
  );
}
