import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LEAF_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699472baee00632b405a28ce/4c0c22833_Asset.png';

export default function BreakMode({ 
  duration = 10,
  onComplete,
  screenScale = 1,
  breakConfig = {}
}) {
  const title = breakConfig.title || 'הפסקה';
  const subtitle = breakConfig.subtitle || 'הסדנא תחודש בעוד:';
  const bgColor = breakConfig.bgColor || null;

  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: bgColor || 'var(--bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background leaf */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute opacity-[0.06]"
          style={{ top: '8%', right: '8%' }}
          animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          <img src={LEAF_IMG} alt="" style={{ width: `${380 * screenScale}px`, height: 'auto' }} draggable={false} />
        </motion.div>
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: `${28 * screenScale}px` }}
        >
          <img 
            src={LEAF_IMG}
            alt=""
            style={{ width: `${110 * screenScale}px`, height: 'auto', margin: '0 auto', opacity: 0.55 }}
            draggable={false}
          />
        </motion.div>
        
        <h1 className="text-primary font-light mb-4" style={{ fontSize: `${64 * screenScale}px` }}>
          {title}
        </h1>
        
        <p className="text-secondary mb-12" style={{ fontSize: `${28 * screenScale}px` }}>
          {subtitle}
        </p>

        <div 
          className="inline-flex items-center gap-4 bg-white rounded-3xl px-12 py-8"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="text-center">
            <div className="text-primary font-light tabular-nums" style={{ fontSize: `${72 * screenScale}px` }}>
              {String(seconds).padStart(2, '0')}
            </div>
            <div className="text-secondary" style={{ fontSize: `${20 * screenScale}px` }}>שניות</div>
          </div>
          <div className="text-primary font-light" style={{ fontSize: `${72 * screenScale}px` }}>:</div>
          <div className="text-center">
            <div className="text-primary font-light tabular-nums" style={{ fontSize: `${72 * screenScale}px` }}>
              {String(minutes).padStart(2, '0')}
            </div>
            <div className="text-secondary" style={{ fontSize: `${20 * screenScale}px` }}>דקות</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}