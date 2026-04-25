import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

// Hebrew number conversion
const hebrewNumerals = {
  1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
  10: 'י', 11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט',
  20: 'כ', 21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט',
  30: 'ל'
};

const hebrewMonths = {
  'Tishri': 'תשרי', 'Heshvan': 'חשוון', 'Kislev': 'כסלו', 'Tevet': 'טבת',
  'Shevat': 'שבט', 'Adar': 'אדר', 'Adar I': 'אדר א', 'Adar II': 'אדר ב',
  'Nisan': 'ניסן', 'Iyar': 'אייר', 'Sivan': 'סיוון', 'Tamuz': 'תמוז',
  'Av': 'אב', 'Elul': 'אלול'
};

const getHebrewYear = (year) => {
  const hundreds = Math.floor((year % 1000) / 100);
  const tens = Math.floor((year % 100) / 10);
  const ones = year % 10;
  const hundredsLetters = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  const tensLetters = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const onesLetters = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  let result = hundredsLetters[hundreds] + tensLetters[tens] + onesLetters[ones];
  if (result.length > 1) {
    result = result.slice(0, -1) + '"' + result.slice(-1);
  } else {
    result = result + "'";
  }
  return result;
};

const getHebrewDate = () => {
  const today = new Date();
  try {
    const dayFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric' });
    const monthFormatter = new Intl.DateTimeFormat('en-u-ca-hebrew', { month: 'long' });
    const yearFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric' });
    const dayParts = dayFormatter.formatToParts(today);
    const yearParts = yearFormatter.formatToParts(today);
    const monthEng = monthFormatter.format(today);
    let day = 1, year = 5785;
    dayParts.forEach(part => { if (part.type === 'day') day = parseInt(part.value); });
    yearParts.forEach(part => { if (part.type === 'year') year = parseInt(part.value); });
    const dayHeb = hebrewNumerals[day] ? hebrewNumerals[day] + "'" : day;
    const monthHeb = hebrewMonths[monthEng] || monthEng;
    const yearHeb = getHebrewYear(year);
    return `${dayHeb} ב${monthHeb} ${yearHeb}`;
  } catch { return ''; }
};

const hebrewDays = {
  0: 'יום ראשון', 1: 'יום שני', 2: 'יום שלישי',
  3: 'יום רביעי', 4: 'יום חמישי', 5: 'יום שישי', 6: 'מוצאי שבת'
};

export default function Header({ 
  currentSession = 1, 
  totalSessions = 12,
  screenScale = 1,
  showProgress = true,
  hideSessionText = false,
  timerEndTime = null,
  timerTitle = '',
  workshopName = '',
  clockFontScale = 1.0,
  headerTitleScale = 1.0
}) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const hebrewDay = hebrewDays[dayOfWeek];
  const hebrewDate = useMemo(() => getHebrewDate(), []);

  // Live clock
  const [clockTime, setClockTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  const [timerRemaining, setTimerRemaining] = useState(0);
  useEffect(() => {
    if (!timerEndTime) { setTimerRemaining(0); return; }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setTimerRemaining(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timerEndTime]);

  const timerMinutes = Math.floor(timerRemaining / 60);
  const timerSeconds = timerRemaining % 60;
  const isTimerWarning = timerRemaining > 0 && timerRemaining <= 60;

  const dots = useMemo(() => {
    return Array.from({ length: totalSessions }, (_, i) => ({
      index: i + 1,
      filled: i < currentSession
    }));
  }, [currentSession, totalSessions]);

  const primary = '#2F4580';
  const bg = '#E8ECF2';
  const border = '#7A8FBF';
  const capsuleBg = '#DDE3ED';

  const sideWidth = Math.round(220 * screenScale);
  const timerColWidth = Math.round(190 * screenScale);
  // Logo height must never be clipped — header min-height is driven by logo + padding
  const logoHeight = Math.round(150 * screenScale);
  const headerMinHeight = logoHeight + Math.round(28 * screenScale);

  return (
    <div
      className="relative w-full flex-shrink-0 flex items-center"
      style={{
        minHeight: `${headerMinHeight}px`,
        zIndex: 20,
        backgroundColor: bg,
        padding: `${12 * screenScale}px ${24 * screenScale}px`,
        gap: `${12 * screenScale}px`,
      }}
    >
      {/* RIGHT — Clock + Day + Hebrew date */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0 text-center"
        style={{ width: `${sideWidth}px` }}
      >
        <div style={{ fontSize: `${14 * screenScale * clockFontScale}px`, color: primary, opacity: 0.5, marginBottom: `${2 * screenScale}px` }}>
          בס"ד
        </div>
        <div
          className="font-black tabular-nums"
          style={{
            fontSize: `${88 * screenScale * clockFontScale}px`,
            color: primary,
            lineHeight: 1,
            letterSpacing: '0.02em',
            textShadow: `0 2px 12px rgba(47,69,128,0.25)`,
          }}
        >
          {clockTime}
        </div>
        <div
          className="font-bold"
          style={{
            fontSize: `${26 * screenScale * clockFontScale}px`,
            color: primary,
            marginTop: `${4 * screenScale}px`,
            lineHeight: 1,
          }}
        >
          {hebrewDay}
        </div>
        <div
          className="font-semibold"
          style={{
            fontSize: `${20 * screenScale * clockFontScale}px`,
            color: primary,
            opacity: 0.85,
            marginTop: `${3 * screenScale}px`,
          }}
        >
          {hebrewDate}
        </div>
      </div>

      {/* INNER-RIGHT — Timer zone (always reserved, shown when active) */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center text-center"
        style={{ width: `${timerColWidth}px` }}
      >
        {timerRemaining > 0 && (
          <motion.div
            className="flex flex-col items-center justify-center rounded-2xl"
            style={{
              background: isTimerWarning
                ? 'rgba(192,57,43,0.12)'
                : 'rgba(47,69,128,0.10)',
              border: `${2 * screenScale}px solid ${isTimerWarning ? 'rgba(192,57,43,0.5)' : 'rgba(47,69,128,0.3)'}`,
              padding: `${8 * screenScale}px ${16 * screenScale}px`,
              boxShadow: isTimerWarning
                ? `0 0 20px rgba(192,57,43,0.3)`
                : `0 0 12px rgba(47,69,128,0.2)`,
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {timerTitle && (
              <div style={{
                fontSize: `${26 * screenScale}px`,
                color: isTimerWarning ? '#C0392B' : primary,
                fontWeight: 900,
                marginBottom: `${6 * screenScale}px`,
                letterSpacing: '0.02em',
                textShadow: isTimerWarning
                  ? `0 0 14px rgba(192,57,43,0.5)`
                  : `0 0 10px rgba(47,69,128,0.35)`,
              }}>
                {timerTitle}
              </div>
            )}
            <div
              className="font-black tabular-nums"
              style={{
                fontSize: `${68 * screenScale}px`,
                color: isTimerWarning ? '#C0392B' : primary,
                lineHeight: 1,
                letterSpacing: '0.04em',
                textShadow: isTimerWarning
                  ? `0 0 20px rgba(192,57,43,0.6)`
                  : `0 0 12px rgba(47,69,128,0.4)`,
              }}
            >
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
          </motion.div>
        )}
      </div>

      {/* CENTER — Capsule with workshop name + progress */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <div
          style={{
            background: capsuleBg,
            border: `${2 * screenScale}px solid ${border}`,
            borderRadius: `${20 * screenScale}px ${20 * screenScale}px ${40 * screenScale}px ${40 * screenScale}px`,
            padding: `${14 * screenScale}px ${40 * screenScale}px ${18 * screenScale}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: `${280 * screenScale}px`,
            maxWidth: `${520 * screenScale}px`,
            width: '100%',
          }}
        >
          {/* Workshop name */}
          <div
            className="font-bold text-center"
            style={{
              fontSize: `${56 * screenScale * headerTitleScale}px`,
              color: primary,
              lineHeight: 1.1,
            }}
          >
            {workshopName || ''}
          </div>

          {showProgress && (
            <>
              {/* Session label - hidden when hideSessionText is true */}
              {!hideSessionText && (
                <div
                  className="font-bold"
                  style={{
                    fontSize: `${22 * screenScale}px`,
                    color: primary,
                    opacity: 0.85,
                    marginTop: `${8 * screenScale}px`,
                    letterSpacing: '0.01em',
                  }}
                >
                  מפגש {currentSession} מתוך {totalSessions}
                </div>
              )}

              {/* Progress dots only */}
              <div className="flex items-center flex-wrap justify-center" style={{ gap: `${6 * screenScale}px`, marginTop: `${10 * screenScale}px` }}>
                {dots.map((dot) => (
                  <div
                    key={dot.index}
                    className="rounded-full"
                    style={{
                      width: `${dot.filled ? 20 * screenScale : 14 * screenScale}px`,
                      height: `${dot.filled ? 20 * screenScale : 14 * screenScale}px`,
                      border: `${2.5 * screenScale}px solid ${primary}`,
                      backgroundColor: dot.filled ? primary : 'transparent',
                      opacity: dot.filled ? 1 : 0.35,
                      boxShadow: dot.filled ? `0 0 6px rgba(47,69,128,0.5)` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* LEFT — Logo with framer-motion heartbeat */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0"
        style={{ width: `${sideWidth}px` }}
      >
        <div style={{ position: 'relative', display: 'inline-block', borderRadius: '8px' }}>
          <motion.img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699472baee00632b405a28ce/2a3c4349f_.png"
            alt="מח ולב"
            style={{
              height: `${logoHeight}px`,
              width: 'auto',
              display: 'block',
              mixBlendMode: 'multiply',
            }}
            animate={{
              filter: [
                'brightness(1) drop-shadow(0 2px 4px rgba(47,69,128,0.1))',
                'brightness(1.08) drop-shadow(0 4px 12px rgba(47,69,128,0.3))',
                'brightness(1) drop-shadow(0 2px 4px rgba(47,69,128,0.1))',
              ]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Shimmer light bar */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '35%',
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.65) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
            animate={{ left: ['-40%', '130%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
          />
        </div>
      </div>
    </div>
  );
}