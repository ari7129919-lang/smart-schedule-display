import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock3, ListDetails, MapPin } from 'lucide-react';
import {
  getCalendarDays,
  getEventsForDate,
  formatGregorianMonthYear,
  formatHebrewDay,
  formatHebrewMonthYear,
  formatHebrewDate,
  formatEventTime,
} from '@/lib/calendarEvents';

const DAY_HEADERS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function EventTitleBubble({ events, screenScale, rotationSeconds }) {
  const [index, setIndex] = useState(0);
  const eventKey = events.map(event => event.id).join(',');
  useEffect(() => {
    setIndex(0);
    if (events.length <= 1) return undefined;
    const interval = setInterval(() => setIndex(current => (current + 1) % events.length), rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [eventKey, events.length, rotationSeconds]);
  const event = events[index];
  return (
    <motion.div
      key={event?.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute bottom-2 left-2 right-2 z-50 rounded-xl border-4 px-3 py-2 shadow-xl"
      style={{ backgroundColor: 'var(--board-section-bg, #E6F4F4)', color: 'var(--board-text, #333)', borderColor: event?.color || '#5FAFA8' }}
    >
      <div className="break-words text-center font-black leading-tight" style={{ fontSize: `${30 * screenScale}px` }}>{event?.title}</div>
      {events.length > 1 && <div className="mt-1 text-center font-bold text-slate-600" style={{ fontSize: `${14 * screenScale}px` }}>{index + 1} מתוך {events.length}</div>}
    </motion.div>
  );
}

function DayBlock({ dateKey, screenScale, isToday, events, rotationSeconds }) {
  return (
    <div className={`relative z-0 flex min-h-0 min-w-0 flex-col items-center justify-center rounded-2xl border-4 p-3 text-center ${events.length > 0 ? 'z-40' : ''} ${isToday ? 'border-amber-500 bg-amber-50' : 'border-slate-400 bg-white'}`}>
      <div className="font-black leading-none text-emerald-900" style={{ fontSize: `${82 * screenScale}px` }}>{formatHebrewDay(dateKey)}</div>
      <div className="mt-3 font-black text-slate-700" style={{ fontSize: `${34 * screenScale}px` }}>{new Date(`${dateKey}T12:00:00Z`).getUTCDate()}</div>
      {events.length > 0 && <EventTitleBubble events={events} screenScale={screenScale} rotationSeconds={rotationSeconds} />}
    </div>
  );
}

function EventDetailsCard({ event, screenScale }) {
  return (
    <div className="min-w-0 rounded-xl border-4 bg-white px-6 py-4 shadow-sm" style={{ borderColor: event.color || '#5FAFA8' }}>
      <div className="break-words font-black text-emerald-900" style={{ fontSize: `${40 * screenScale}px` }}>{event.title}</div>
      <div className="mt-2 flex items-center gap-3 font-black text-slate-800" style={{ fontSize: `${32 * screenScale}px` }}><CalendarDays size={28 * screenScale} className="shrink-0 text-emerald-700" />{formatHebrewDate(event.eventDate)}</div>
      {(event.startTime || event.endTime) && <div className="mt-1 flex items-center gap-3 font-bold text-slate-600" style={{ fontSize: `${27 * screenScale}px` }}><Clock3 size={25 * screenScale} className="shrink-0 text-emerald-700" />{formatEventTime(event)}</div>}
      {event.location && <div className="mt-1 flex items-center gap-3 font-bold text-slate-600" style={{ fontSize: `${25 * screenScale}px` }}><MapPin size={24 * screenScale} className="shrink-0 text-emerald-700" />{event.location}</div>}
      {event.description && <div className="mt-2 line-clamp-3 font-bold leading-snug text-slate-800" style={{ fontSize: `${27 * screenScale}px` }}>{event.description}</div>}
    </div>
  );
}

function EventDetailsPanel({ events, screenScale, rotationSeconds }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(events.length / 2));
  useEffect(() => {
    setPage(0);
    if (pageCount <= 1) return undefined;
    const interval = setInterval(() => setPage(current => (current + 1) % pageCount), rotationSeconds * 1000);
    return () => clearInterval(interval);
  }, [events, pageCount, rotationSeconds]);
  if (events.length === 0) return null;
  const pageEvents = events.slice(page * 2, page * 2 + 2);
  const first = page * 2 + 1;
  const last = page * 2 + pageEvents.length;
  return (
    <div className="shrink-0 rounded-2xl border-4 border-slate-400 bg-slate-200 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-black text-slate-900" style={{ fontSize: `${34 * screenScale}px` }}><ListDetails size={34 * screenScale} className="shrink-0 text-emerald-700" />פרטי אירועים</div>
        {events.length > 2 && <div className="rounded-full bg-slate-800 px-4 py-2 font-bold text-white" style={{ fontSize: `${18 * screenScale}px` }}>אירועים {first}–{last} מתוך {events.length}</div>}
      </div>
      <div className={pageEvents.length > 1 ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'grid grid-cols-1 gap-3'}>{pageEvents.map(event => <EventDetailsCard key={event.id} event={event} screenScale={screenScale} />)}</div>
    </div>
  );
}

export default function CalendarDisplay({ events = [], screenScale = 1, rotationSeconds = 6, upcomingEvent }) {
  const displayScale = Math.max(screenScale, 1);
  const days = useMemo(() => getCalendarDays(), []);
  const today = days[0];
  const eventsByDate = useMemo(() => Object.fromEntries(days.map(day => [day, getEventsForDate(events, day)])), [days, events]);
  const allEvents = useMemo(() => days.flatMap(day => eventsByDate[day] || []), [days, eventsByDate]);
  const displayEvents = useMemo(() => {
    if (!upcomingEvent || !allEvents.some(event => event.id === upcomingEvent.id)) return allEvents;
    return [upcomingEvent, ...allEvents.filter(event => event.id !== upcomingEvent.id)];
  }, [allEvents, upcomingEvent]);
  const firstWeekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const paddedDays = [...Array(firstWeekday).fill(null), ...days];
  const cells = [...paddedDays, ...Array((7 - (paddedDays.length % 7)) % 7).fill(null)];
  const rowCount = cells.length / 7;
  const hebrewMonths = [...new Set(days.map(formatHebrewMonthYear))];
  const gregorianMonths = [...new Set(days.map(formatGregorianMonthYear))];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="absolute inset-0 z-40 flex min-w-0 flex-col overflow-hidden rounded-3xl bg-slate-100 p-4" dir="rtl">
      <div className="mb-3 flex shrink-0 items-center justify-between border-b-2 border-slate-400 pb-3">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden"><CalendarDays size={40 * displayScale} className="shrink-0 text-emerald-700" /><div className="min-w-0"><h2 className="truncate font-black text-slate-900" style={{ fontSize: `${46 * displayScale}px` }}>{hebrewMonths.join(' · ')}</h2><div className="truncate font-semibold text-slate-500" style={{ fontSize: `${18 * displayScale}px` }}>{gregorianMonths.join(' · ')}</div></div></div>
        <div className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 font-bold text-white" style={{ fontSize: `${15 * displayScale}px` }}>30 ימים קרובים</div>
      </div>
      <div className="mb-3 grid shrink-0 grid-cols-7 gap-2">{DAY_HEADERS.map(day => <div key={day} className="rounded-lg bg-slate-800 py-2 text-center font-black tracking-wide text-white shadow-sm" style={{ fontSize: `${25 * displayScale}px` }}>{day}</div>)}</div>
      <div className="grid min-h-0 flex-1 grid-cols-7 gap-2 overflow-visible" style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}>{cells.map((dateKey, index) => dateKey ? <DayBlock key={dateKey} dateKey={dateKey} screenScale={displayScale} isToday={dateKey === today} events={eventsByDate[dateKey] || []} rotationSeconds={rotationSeconds} /> : <div key={`empty-${index}`} />)}</div>
      <div className="mt-3"><EventDetailsPanel events={displayEvents} screenScale={displayScale} rotationSeconds={rotationSeconds} /></div>
    </motion.div>
  );
}
