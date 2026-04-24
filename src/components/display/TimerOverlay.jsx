import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Audio helpers ---
function createBeep(frequency = 880, duration = 0.15, volume = 0.5) {
  return () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };
}

const playStart = createBeep(660, 0.2, 0.4);
const playTick  = createBeep(1100, 0.08, 0.3);
const playEnd   = () => {
  [880, 660, 440].forEach((f, i) => {
    setTimeout(() => createBeep(f, 0.25, 0.5)(), i * 280);
  });
};

// Global flag to prevent double-start from poll loop
let _timerStartedAt = 0;

export default function TimerOverlay({ screenScale = 1, fullScreenThresholdSeconds = 180, centerOnly = false }) {
  const [timer, setTimer] = useState({ isActive: false, remaining: 0, duration: 0, title: '' });
  const intervalRef = useRef(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const clearAll = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    _timerStartedAt = 0;
    localStorage.removeItem('display_timer_end');
    localStorage.removeItem('display_timer_title');
    localStorage.removeItem('display_timer_stop');
  }, []);

  const stopTimer = useCallback(() => {
    localStorage.setItem('display_timer_stop', Date.now().toString());
    clearAll();
    setTimer({ isActive: false, remaining: 0, duration: 0, title: '' });
  }, [clearAll]);

  const startCountdown = useCallback((seconds, title) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const next = prev.remaining - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          _timerStartedAt = 0;
          localStorage.removeItem('display_timer_end');
          localStorage.removeItem('display_timer_title');
          playEnd();
          return { isActive: false, remaining: 0, duration: 0, title: '' };
        }
        if (next <= 10) playTick();
        return { ...prev, remaining: next };
      });
    }, 1000);
  }, []);

  const startTimer = useCallback((minutes, title = '') => {
    if (intervalRef.current) return;
    const seconds = minutes * 60;
    const endTime = Date.now() + seconds * 1000;
    _timerStartedAt = endTime;
    localStorage.setItem('display_timer_end', endTime.toString());
    if (title) localStorage.setItem('display_timer_title', title);
    setTimer({ isActive: true, remaining: seconds, duration: seconds, title });
    playStart();
    startCountdown(seconds, title);
  }, [startCountdown]);

  // Restore timer from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('display_timer_end');
    const storedTitle = localStorage.getItem('display_timer_title') || '';
    if (stored) {
      const endTime = parseInt(stored);
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining > 0) {
        _timerStartedAt = endTime;
        setTimer({ isActive: true, remaining, duration: remaining, title: storedTitle });
        startCountdown(remaining, storedTitle);
      } else {
        localStorage.removeItem('display_timer_end');
      }
    }
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line

  // Poll localStorage for admin commands
  useEffect(() => {
    const check = () => {
      const stopFlag = localStorage.getItem('display_timer_stop');
      if (stopFlag) {
        localStorage.removeItem('display_timer_stop');
        stopTimer();
        return;
      }
      const stored = localStorage.getItem('display_timer_end');
      if (stored && !intervalRef.current) {
        const endTime = parseInt(stored);
        if (endTime === _timerStartedAt) return;
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining > 0) {
          const t = localStorage.getItem('display_timer_title') || '';
          _timerStartedAt = endTime;
          setTimer({ isActive: true, remaining, duration: remaining, title: t });
          playStart();
          startCountdown(remaining, t);
        }
      }
    };
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [stopTimer, startCountdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.repeat) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'PageUp') {
        startTimer(10, 'הפסקה 10 דקות');
      } else if (e.key === 'PageDown') {
        startTimer(15, 'הפסקה 15 דקות');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        stopTimer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stopTimer, startTimer]);

  const minutes = Math.floor(timer.remaining / 60);
  const seconds = timer.remaining % 60;
  // Show full screen: first 10s OR last N seconds
  const elapsed = timer.duration - timer.remaining;
  const showFullScreen = timer.isActive && timer.remaining > 0 && (elapsed < 10 || timer.remaining <= fullScreenThresholdSeconds);
  // Last 30s — urgent pulsing
  const isUrgent = timer.remaining > 0 && timer.remaining <= 30;

  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Shared timer content
  const timerContent = (
    <>
      {timer.title && (
        <div
          className="font-semibold mb-6 text-center"
          style={{ fontSize: `${28 * screenScale}px`, color: 'rgba(255,160,160,0.85)' }}
        >
          {timer.title}
        </div>
      )}

      <motion.div
        className="font-bold tabular-nums"
        animate={isUrgent
          ? { scale: [1, 1.06, 1], textShadow: ['0 0 20px rgba(255,60,60,0.5)', '0 0 50px rgba(255,60,60,0.9)', '0 0 20px rgba(255,60,60,0.5)'] }
          : { scale: 1, textShadow: '0 0 30px rgba(255,80,80,0.4)' }
        }
        transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
        style={{
          fontSize: centerOnly ? `${120 * screenScale}px` : `${160 * screenScale}px`,
          color: '#FF3333',
          lineHeight: 1,
          letterSpacing: '0.04em',
        }}
      >
        {timeStr}
      </motion.div>

      <div
        className="mt-6 opacity-30 text-center"
        style={{ fontSize: `${16 * screenScale}px`, color: '#fff' }}
      >
        ESC לביטול
      </div>
    </>
  );

  if (centerOnly) {
    // Center-only mode: render only in center column area
    return (
      <>
        {/* Watermark timer - smaller in center-only mode */}
        <AnimatePresence>
          {timer.isActive && !showFullScreen && (
            <motion.div
              key="timer-watermark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <motion.div
                className="font-black tabular-nums select-none"
                animate={isUrgent
                  ? { opacity: [0.12, 0.22, 0.12] }
                  : { opacity: 0.1 }
                }
                transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
                style={{
                  fontSize: `${280 * screenScale}px`,
                  color: isUrgent ? '#C0392B' : '#2F4580',
                  lineHeight: 1,
                  letterSpacing: '0.04em',
                  userSelect: 'none',
                }}
              >
                {timeStr}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen timer overlay - centered in the middle column only */}
        <AnimatePresence>
          {timer.isActive && showFullScreen && (
            <motion.div
              key="timer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center z-40 rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'rgba(10, 15, 35, 0.92)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                className="flex flex-col items-center"
                style={{
                  background: isUrgent ? 'rgba(40, 8, 8, 0.97)' : 'rgba(30, 15, 15, 0.97)',
                  borderRadius: `${48 * screenScale}px`,
                  padding: `${48 * screenScale}px ${80 * screenScale}px`,
                  border: `${3 * screenScale}px solid rgba(220, 50, 50, 0.4)`,
                  boxShadow: isUrgent
                    ? `0 0 80px rgba(220,40,40,0.6), 0 24px 80px rgba(0,0,0,0.5)`
                    : `0 0 40px rgba(220,40,40,0.3), 0 24px 80px rgba(0,0,0,0.5)`,
                  minWidth: `${400 * screenScale}px`,
                  transition: 'box-shadow 0.4s ease',
                }}
              >
                {timerContent}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Full-screen mode (default)
  return (
    <>
      {/* Watermark timer — always visible when timer is active but NOT in fullscreen mode */}
      <AnimatePresence>
        {timer.isActive && !showFullScreen && (
          <motion.div
            key="timer-watermark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 15 }}
          >
            <motion.div
              className="font-black tabular-nums select-none"
              animate={isUrgent
                ? { opacity: [0.12, 0.22, 0.12] }
                : { opacity: 0.1 }
              }
              transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
              style={{
                fontSize: `${380 * screenScale}px`,
                color: isUrgent ? '#C0392B' : '#2F4580',
                lineHeight: 1,
                letterSpacing: '0.04em',
                userSelect: 'none',
              }}
            >
              {timeStr}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen timer overlay */}
      <AnimatePresence>
        {timer.isActive && showFullScreen && (
          <motion.div
            key="timer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(10, 15, 35, 0.82)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              className="flex flex-col items-center"
              style={{
                background: isUrgent ? 'rgba(40, 8, 8, 0.97)' : 'rgba(30, 15, 15, 0.97)',
                borderRadius: `${48 * screenScale}px`,
                padding: `${64 * screenScale}px ${100 * screenScale}px`,
                border: `${3 * screenScale}px solid rgba(220, 50, 50, 0.4)`,
                boxShadow: isUrgent
                  ? `0 0 80px rgba(220,40,40,0.6), 0 24px 80px rgba(0,0,0,0.5)`
                  : `0 0 40px rgba(220,40,40,0.3), 0 24px 80px rgba(0,0,0,0.5)`,
                minWidth: `${480 * screenScale}px`,
                transition: 'box-shadow 0.4s ease',
              }}
            >
              {timerContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}