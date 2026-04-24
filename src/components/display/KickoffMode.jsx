import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LuxuryClock from './LuxuryClock';

const LEAF_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699472baee00632b405a28ce/4c0c22833_Asset.png';

export default function KickoffMode({ onComplete, screenScale = 1, kickoffConfig = {}, centerOnly = false }) {
  const readyTitle = kickoffConfig.readyTitle || 'הסדנא עומדת להתחיל';
  const readySubtitle = kickoffConfig.readySubtitle || 'נא להכנס לאולם';
  const startedTitle = kickoffConfig.startedTitle || 'הסדנא התחילה';
  const quietText = kickoffConfig.quietText || 'נא לשמור על השקט';

  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (phase !== 'countdown') return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); setPhase('started'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'started') return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        if (prev >= 180) { clearInterval(interval); onComplete?.(); return prev; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;

  // Scale factor for large screen — base sizes are designed for 60"
  const s = screenScale;

  const clockStyle = kickoffConfig.clockStyle || 'gold';
  const clockSize = parseFloat(kickoffConfig.clockSize) || 0.7;
  const showClock = kickoffConfig.showClock !== false;

  // Inner content that is shared between full-screen and center-only modes
  const kickoffContent = (
    <div className="text-center text-white h-full flex flex-col items-center justify-center">
      {/* Luxury Clock at top */}
      {showClock && <LuxuryClock screenScale={s} clockStyle={clockStyle} clockSize={clockSize} />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.04, 1], opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
        style={{ marginBottom: `${60 * s}px` }}
      >
        <img
          src={LEAF_IMG}
          alt=""
          style={{ width: `${280 * s}px`, height: 'auto', margin: '0 auto', opacity: 0.9 }}
          draggable={false}
        />
      </motion.div>

      {phase === 'countdown' ? (
        <>
          <motion.h1
            className="font-light"
            style={{ fontSize: centerOnly ? `${70 * s}px` : `${90 * s}px`, marginBottom: `${24 * s}px` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {readyTitle}
          </motion.h1>
          <motion.p
            className="opacity-80"
            style={{ fontSize: centerOnly ? `${42 * s}px` : `${52 * s}px`, marginBottom: `${48 * s}px` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {readySubtitle}
          </motion.p>
          <motion.div
            className="inline-flex items-center justify-center rounded-full bg-white/10"
            style={{
              width: `${220 * s}px`,
              height: `${220 * s}px`,
              fontSize: `${110 * s}px`,
              fontWeight: 700
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {countdown}
          </motion.div>
        </>
      ) : (
        <>
          <motion.h1
            className="font-light"
            style={{ fontSize: centerOnly ? `${70 * s}px` : `${90 * s}px`, marginBottom: `${24 * s}px` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {startedTitle}
          </motion.h1>
          <motion.p
            className="opacity-80"
            style={{ fontSize: `${42 * s}px`, marginBottom: `${28 * s}px` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            לפני
          </motion.p>
          <motion.div
            className="inline-flex items-center justify-center gap-4 rounded-3xl bg-white/10"
            style={{
              padding: `${24 * s}px ${60 * s}px`,
              fontSize: `${130 * s}px`,
              fontWeight: 700,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="tabular-nums">{String(elapsedSecs).padStart(2, '0')}</span>
            <span className="opacity-60">:</span>
            <span className="tabular-nums">{String(elapsedMinutes).padStart(2, '0')}</span>
          </motion.div>
          <motion.p
            className="text-yellow-300"
            style={{ fontSize: `${58 * s}px`, marginTop: `${40 * s}px` }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {quietText}
          </motion.p>
        </>
      )}
    </div>
  );

  if (centerOnly) {
    // Center-only mode: appears only in the center column (notices area)
    return (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--primary)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        {kickoffContent}
      </motion.div>
    );
  }

  // Full-screen mode (default)
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--primary)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {kickoffContent}
    </motion.div>
  );
}