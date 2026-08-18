import { useEffect, useState } from 'react';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const RESYNC_INTERVAL_MS = 5 * 60 * 1000;

const timeFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: ISRAEL_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

let clockOffsetMs = 0;
let lastSyncAt = 0;
let syncPromise = null;

export const getIsraelTime = (date = new Date()) => timeFormatter.format(date);

export const getIsraelSecondsSinceMidnight = (date = new Date()) => {
  const parts = timeFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => ['hour', 'minute', 'second'].includes(type))
      .map(({ type, value }) => [type, Number(value)])
  );
  return values.hour * 3600 + values.minute * 60 + values.second;
};

export const getIsraelDate = (timestamp = Date.now()) => new Date(timestamp + clockOffsetMs);

// The response Date header gives us an independent, network-synchronised clock.
// Taking the request midpoint compensates for most of the round-trip delay.
const syncWithServer = async () => {
  if (syncPromise) return syncPromise;
  if (Date.now() - lastSyncAt < RESYNC_INTERVAL_MS) return clockOffsetMs;

  syncPromise = (async () => {
    try {
      const startedAt = Date.now();
      const url = new URL(window.location.href);
      url.searchParams.set('_clock_sync', String(startedAt));
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const finishedAt = Date.now();
      const serverDate = response.headers.get('date');

      if (serverDate) {
        // HTTP dates have one-second precision, so use the centre of that second.
        const serverTime = Date.parse(serverDate) + 500;
        const localMidpoint = (startedAt + finishedAt) / 2;
        const measuredOffset = serverTime - localMidpoint;

        // Ignore implausible/cached responses while still correcting real device drift.
        if (Number.isFinite(measuredOffset) && Math.abs(measuredOffset) < 24 * 60 * 60 * 1000) {
          clockOffsetMs = measuredOffset;
          lastSyncAt = finishedAt;
        }
      }
    } catch {
      // The device clock remains a safe fallback when the display is offline.
    } finally {
      syncPromise = null;
    }

    return clockOffsetMs;
  })();

  return syncPromise;
};

export default function useIsraelClock() {
  const [now, setNow] = useState(() => getIsraelDate());

  useEffect(() => {
    let timeoutId;
    let cancelled = false;

    const scheduleNextSecond = () => {
      if (cancelled) return;
      const correctedNow = Date.now() + clockOffsetMs;
      setNow(new Date(correctedNow));
      const delay = Math.max(20, 1000 - (correctedNow % 1000));
      timeoutId = window.setTimeout(scheduleNextSecond, delay);
    };

    const resync = async () => {
      await syncWithServer();
      if (!cancelled) {
        window.clearTimeout(timeoutId);
        scheduleNextSecond();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resync();
    };

    scheduleNextSecond();
    resync();
    const syncInterval = window.setInterval(resync, RESYNC_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', resync);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', resync);
    };
  }, []);

  return now;
}
