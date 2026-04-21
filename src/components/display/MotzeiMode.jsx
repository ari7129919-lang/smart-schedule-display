import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LuxuryClock from './LuxuryClock';

const LEAF_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699472baee00632b405a28ce/4c0c22833_Asset.png';

// Phone display with light sweep + digit pulse animations
function PhoneDisplay({ contactLabel, contactNumber, s }) {
  const digits = contactNumber.split('');
  const [activeDigit, setActiveDigit] = useState(-1);

  // Cycle through digits one by one — slow and calm
  useEffect(() => {
    let idx = 0;
    const iv = setInterval(() => {
      setActiveDigit(idx);
      idx = (idx + 1) % digits.length;
    }, 900);
    return () => clearInterval(iv);
  }, [digits.length]);

  return (
    <motion.div
      className="inline-block rounded-2xl relative overflow-hidden"
      style={{ 
        padding: `${32 * s}px ${64 * s}px`,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      {/* Light sweep bar */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '45%',
          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.25) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
        animate={{ left: ['-50%', '130%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
      />

      {contactLabel && (
        <div className="opacity-70" style={{ fontSize: `${36 * s}px`, marginBottom: `${12 * s}px` }}>
          {contactLabel}
        </div>
      )}

      {/* Digits with pulse */}
      <div className="flex items-center justify-center tabular-nums" dir="ltr">
        {digits.map((ch, i) => (
          <motion.span
            key={i}
            style={{ fontSize: `${72 * s}px`, fontWeight: 600, display: 'inline-block', lineHeight: 1 }}
            animate={activeDigit === i
              ? { scale: [1, 1.25, 1], color: ['#ffffff', '#FFE082', '#ffffff'] }
              : { scale: 1, color: '#ffffff' }
            }
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {ch}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function MotzeiMode({ screenScale = 1, motzeiConfig = {} }) {
  const title = motzeiConfig.title || 'שבוע טוב';
  const subtitle = motzeiConfig.subtitle || 'שיעור במוסר והשקפה';
  const contactLabel = motzeiConfig.contactLabel || 'להתקשרות:';
  const contactNumber = motzeiConfig.contactNumber || '072-2351290';

  const s = screenScale;
  const clockStyle = motzeiConfig.clockStyle || 'gold';
  const clockSize = parseFloat(motzeiConfig.clockSize) || 0.7;
  const showClock = motzeiConfig.showClock !== false;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--primary)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* Background leaf watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute opacity-[0.04]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <img src={LEAF_IMG} alt="" style={{ width: `${800 * s}px`, height: 'auto' }} draggable={false} />
        </motion.div>
      </div>

      <div className="text-center text-white relative z-10">

        {/* Luxury Clock */}
        {showClock && <LuxuryClock screenScale={s} clockStyle={clockStyle} clockSize={clockSize} />}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ marginBottom: `${50 * s}px` }}
        >
          <img 
            src={LEAF_IMG}
            alt=""
            style={{ 
              width: `${220 * s}px`, 
              height: 'auto', 
              margin: '0 auto',
              opacity: 0.85,
              filter: 'brightness(3) saturate(0)'
            }}
            draggable={false}
          />
        </motion.div>
        
        <motion.h1 
          className="font-light"
          style={{ fontSize: `${120 * s}px`, marginBottom: `${24 * s}px` }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="opacity-80"
          style={{ fontSize: `${56 * s}px`, marginBottom: `${48 * s}px` }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {subtitle}
        </motion.p>

        {contactNumber && (
          <PhoneDisplay contactLabel={contactLabel} contactNumber={contactNumber} s={s} />
        )}
      </div>
    </motion.div>
  );
}