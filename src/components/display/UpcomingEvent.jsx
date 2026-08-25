import React from 'react';
import { CalendarClock, Clock3, MapPin } from 'lucide-react';
import { formatEventTime, formatGregorianDate, formatHebrewDate } from '@/lib/calendarEvents';

export default function UpcomingEvent({ event, screenScale = 1 }) {
  if (!event) return <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center text-slate-400" style={{ fontSize: `${18 * screenScale}px` }}>אין אירועים קרובים</div>;
  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border-2 bg-white/95 p-5 text-center shadow-sm" style={{ borderColor: event.color || '#5FAFA8' }} dir="rtl">
      <CalendarClock className="mx-auto mb-2 text-emerald-700" size={36 * screenScale} />
      <div className="font-bold text-emerald-700" style={{ fontSize: `${18 * screenScale}px` }}>האירוע הקרוב</div>
      <h3 className="mt-1 font-black text-slate-800" style={{ fontSize: `${26 * screenScale}px`, lineHeight: 1.15 }}>{event.title}</h3>
      <div className="mt-3 font-black text-emerald-800" style={{ fontSize: `${28 * screenScale}px` }}>{formatHebrewDate(event.eventDate)}</div>
      <div className="text-slate-500" style={{ fontSize: `${13 * screenScale}px` }}>{formatGregorianDate(event.eventDate)}</div>
      <div className="mt-2 flex items-center justify-center gap-1 font-bold text-slate-700" style={{ fontSize: `${18 * screenScale}px` }}><Clock3 size={17 * screenScale} />{formatEventTime(event)}</div>
      {event.location && <div className="mt-1 flex items-center justify-center gap-1 text-slate-600" style={{ fontSize: `${15 * screenScale}px` }}><MapPin size={15 * screenScale} />{event.location}</div>}
      {event.description && <div className="mt-3 line-clamp-4 text-slate-600" style={{ fontSize: `${15 * screenScale}px` }}>{event.description}</div>}
    </div>
  );
}
