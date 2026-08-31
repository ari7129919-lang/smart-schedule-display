const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: ISRAEL_TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const hebrewFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
  timeZone: ISRAEL_TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: ISRAEL_TIME_ZONE,
  weekday: 'short',
});

const pad = (value) => String(value).padStart(2, '0');

const HEBREW_DIGITS = [
  [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'],
  [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'],
  [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א'],
];

function toHebrewNumeral(value) {
  let remainder = Number(value);
  if (!Number.isFinite(remainder) || remainder <= 0) return '';
  if (remainder === 15) return 'ט\u05f4ו';
  if (remainder === 16) return 'ט\u05f4ז';
  let result = '';
  for (const [amount, letter] of HEBREW_DIGITS) {
    while (remainder >= amount) {
      result += letter;
      remainder -= amount;
    }
  }
  if (result.length === 1) return `${result}\u05f3`;
  return `${result.slice(0, -1)}\u05f4${result.slice(-1)}`;
}

export function getIsraelDateKey(date = new Date()) {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(date)
      .filter(({ type }) => ['year', 'month', 'day'].includes(type))
      .map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getCalendarDays(startDate = getIsraelDateKey()) {
  return Array.from({ length: 30 }, (_, index) => addDays(startDate, index));
}

export function parseEventDateTime(event) {
  if (!event?.eventDate) return Number.POSITIVE_INFINITY;
  const time = event.startTime || '00:00';
  return new Date(`${event.eventDate}T${time}:00+03:00`).getTime();
}

export function getUpcomingEvent(events = [], now = new Date()) {
  const nowKey = getIsraelDateKey(now);
  const nowTime = now.toLocaleTimeString('en-GB', {
    timeZone: ISRAEL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const candidates = events
    .filter(event => event.active !== false && event.eventDate)
    .filter(event => event.eventDate > nowKey || (event.eventDate === nowKey && (!event.startTime || event.startTime >= nowTime)))
    .sort((a, b) => parseEventDateTime(a) - parseEventDateTime(b));
  return candidates[0] || null;
}

export function getEventsForDate(events, dateKey) {
  return events
    .filter(event => event.active !== false && event.eventDate === dateKey)
    .sort((a, b) => parseEventDateTime(a) - parseEventDateTime(b));
}

export function formatGregorianDate(dateKey) {
  return gregorianFormatter.format(new Date(`${dateKey}T12:00:00Z`));
}

function getHebrewParts(dateKey) {
  return Object.fromEntries(
    hebrewFormatter.formatToParts(new Date(`${dateKey}T12:00:00Z`))
      .filter(({ type }) => ['day', 'month', 'year'].includes(type))
      .map(({ type, value }) => [type, value])
  );
}

export function formatHebrewDay(dateKey) {
  const parts = getHebrewParts(dateKey);
  return toHebrewNumeral(Number(String(parts.day || '').replace(/[^0-9]/g, '')));
}

export function formatHebrewMonthYear(dateKey) {
  const parts = getHebrewParts(dateKey);
  const year = Number(String(parts.year || '').replace(/[^0-9]/g, ''));
  return `${parts.month || ''} ${toHebrewNumeral(year >= 1000 ? year % 1000 : year)}`.trim();
}

export function formatGregorianMonthYear(dateKey) {
  return new Intl.DateTimeFormat('he-IL', {
    timeZone: ISRAEL_TIME_ZONE,
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

export function formatHebrewDate(dateKey) {
  return `${formatHebrewDay(dateKey)} ${formatHebrewMonthYear(dateKey)}`.trim();
}

export function formatWeekday(dateKey) {
  return weekdayFormatter.format(new Date(`${dateKey}T12:00:00Z`));
}

export function formatEventTime(event) {
  if (!event?.startTime) return 'כל היום';
  return event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime;
}
