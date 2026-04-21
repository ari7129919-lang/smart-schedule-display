import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const hebrewNumerals = {
  1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',
  10:'י',11:'יא',12:'יב',13:'יג',14:'יד',15:'טו',16:'טז',17:'יז',18:'יח',19:'יט',
  20:'כ',21:'כא',22:'כב',23:'כג',24:'כד',25:'כה',26:'כו',27:'כז',28:'כח',29:'כט',30:'ל'
};
const hebrewMonths = {
  'Tishri':'תשרי','Heshvan':'חשוון','Kislev':'כסלו','Tevet':'טבת',
  'Shevat':'שבט','Adar':'אדר','Adar I':'אדר א','Adar II':'אדר ב',
  'Nisan':'ניסן','Iyar':'אייר','Sivan':'סיוון','Tamuz':'תמוז','Av':'אב','Elul':'אלול'
};
const hebrewDays = {0:'יום ראשון',1:'יום שני',2:'יום שלישי',3:'יום רביעי',4:'יום חמישי',5:'יום שישי',6:'מוצאי שבת'};

const getHebrewYear = (year) => {
  const hundreds = Math.floor((year % 1000) / 100);
  const tens = Math.floor((year % 100) / 10);
  const ones = year % 10;
  const h = ['','ק','ר','ש','ת','תק','תר','תש','תת','תתק'];
  const t = ['','י','כ','ל','מ','נ','ס','ע','פ','צ'];
  const o = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  let r = h[hundreds] + t[tens] + o[ones];
  return r.length > 1 ? r.slice(0,-1) + '"' + r.slice(-1) : r + "'";
};

const getHebrewDate = () => {
  const today = new Date();
  try {
    const dayF = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric' });
    const monthF = new Intl.DateTimeFormat('en-u-ca-hebrew', { month: 'long' });
    const yearF = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { year: 'numeric' });
    let day=1, year=5785;
    dayF.formatToParts(today).forEach(p => { if(p.type==='day') day=parseInt(p.value); });
    yearF.formatToParts(today).forEach(p => { if(p.type==='year') year=parseInt(p.value); });
    const monthEng = monthF.format(today);
    // Format day with geresh: טו → ט"ו, single letter: ה → ה'
    const dayLetters = hebrewNumerals[day] || String(day);
    const dayHeb = dayLetters.length > 1
      ? dayLetters.slice(0,-1) + '"' + dayLetters.slice(-1)
      : dayLetters + "'";
    return `${dayHeb} ${hebrewMonths[monthEng]||monthEng} ${getHebrewYear(year)}`;
  } catch { return ''; }
};

// ── Style definitions ──────────────────────────────────────────────
const CLOCK_STYLES = {
  gold: {
    label: 'זהב יוקרתי',
    timeCss: { 
      fontWeight: 900, letterSpacing: '0.06em',
      background: 'linear-gradient(180deg, #FFE082 0%, #C8860A 40%, #FFD54F 70%, #A0620A 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(200,134,10,0.7))'
    },
    dateCss: { color: '#FFD54F', opacity: 0.9, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 1px 6px rgba(200,134,10,0.5)' },
    divider: 'rgba(255,213,79,0.4)',
  },
  silver: {
    label: 'כסף קלאסי',
    timeCss: {
      fontWeight: 900, letterSpacing: '0.06em',
      background: 'linear-gradient(180deg, #F5F5F5 0%, #9E9E9E 40%, #EEEEEE 70%, #757575 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 8px rgba(150,150,150,0.6))'
    },
    dateCss: { color: '#E0E0E0', opacity: 0.9, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 1px 6px rgba(200,200,200,0.4)' },
    divider: 'rgba(220,220,220,0.35)',
  },
  white_glow: {
    label: 'לבן זוהר',
    timeCss: {
      fontWeight: 900, letterSpacing: '0.04em', color: '#FFFFFF',
      textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)'
    },
    dateCss: { color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: '0.04em' },
    divider: 'rgba(255,255,255,0.25)',
  },
  neon_blue: {
    label: 'ניאון כחול',
    timeCss: {
      fontWeight: 900, letterSpacing: '0.04em', color: '#7DDFFF',
      textShadow: '0 0 20px rgba(125,223,255,0.9), 0 0 50px rgba(125,223,255,0.5), 0 0 80px rgba(100,180,255,0.3)'
    },
    dateCss: { color: '#9BE6FF', fontWeight: 500, letterSpacing: '0.04em', textShadow: '0 0 10px rgba(125,223,255,0.6)' },
    divider: 'rgba(125,223,255,0.3)',
  },
  copper: {
    label: 'נחושת עתיקה',
    timeCss: {
      fontWeight: 900, letterSpacing: '0.06em',
      background: 'linear-gradient(180deg, #FFAB76 0%, #A0522D 40%, #FF8C42 70%, #7B3510 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      filter: 'drop-shadow(0 2px 10px rgba(160,82,45,0.7))'
    },
    dateCss: { color: '#FFAB76', opacity: 0.9, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 1px 6px rgba(160,82,45,0.5)' },
    divider: 'rgba(255,171,118,0.35)',
  },
  minimal: {
    label: 'מינימל לבן',
    timeCss: {
      fontWeight: 200, letterSpacing: '0.12em', color: '#FFFFFF',
      textShadow: '0 2px 15px rgba(255,255,255,0.3)'
    },
    dateCss: { color: 'rgba(255,255,255,0.6)', fontWeight: 300, letterSpacing: '0.08em' },
    divider: 'rgba(255,255,255,0.15)',
  },
};

export { CLOCK_STYLES };

export default function LuxuryClock({ screenScale = 1, clockStyle = 'gold', clockSize = 1 }) {
  const s = screenScale * clockSize;
  const style = CLOCK_STYLES[clockStyle] || CLOCK_STYLES.gold;

  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  });

  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const hebrewDate = useMemo(() => getHebrewDate(), []);
  const today = new Date();
  const hebrewDay = hebrewDays[today.getDay()];
  // Format: יום חמישי ט"ו חשוון תשפ"ו
  const fullHebrewDate = `${hebrewDay} ${hebrewDate}`;

  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ marginBottom: `${40 * s}px` }}
    >
      {/* Time */}
      <motion.div
        className="tabular-nums"
        style={{ fontSize: `${140 * s}px`, lineHeight: 1, ...style.timeCss }}
        animate={{ opacity: [0.94, 1, 0.94] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {time}
      </motion.div>

      {/* Divider */}
      <div style={{ width: `${360 * s}px`, height: `${2 * s}px`, background: style.divider, margin: `${18 * s}px auto` }} />

      {/* Hebrew day + date */}
      <div style={{ fontSize: `${42 * s}px`, ...style.dateCss, fontWeight: style.dateCss.fontWeight || 700 }}>
        {fullHebrewDate}
      </div>
    </motion.div>
  );
}