import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ScrollingTicker({ 
  items = [], 
  screenScale = 1,
  tickerEnabled = true,
  fallbackText = ''
}) {
  const activeItems = useMemo(() => {
    const enabledItems = items.filter(item => item.active && !item.archived).sort((a, b) => (a.priority || 0) - (b.priority || 0));
    return enabledItems.length > 0 ? enabledItems : (fallbackText ? [{ text: fallbackText, active: true }] : []);
  }, [items, fallbackText]);

  if (!tickerEnabled || activeItems.length === 0) {
    return null;
  }

  const fontSize = `${30 * screenScale}px`;
  const tickerHeight = `${80 * screenScale}px`;
  const separatorSize = `${24 * screenScale}px`;

  // Build a single segment row with all items separated by large dots
  const SegmentRow = () => (
    <span className="inline-flex items-center flex-shrink-0" dir="rtl">
      {activeItems.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span 
              className="inline-flex items-center justify-center mx-4"
              style={{ fontSize: separatorSize, lineHeight: 1 }}
            >
              <span className="w-3 h-3 rounded-full bg-white/70 inline-block" />
            </span>
          )}
          <span
            style={{
              fontSize,
              fontWeight: '500',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {item.text}
          </span>
        </React.Fragment>
      ))}
      {/* Extra spacing at end of row */}
      <span style={{ marginLeft: `${60 * screenScale}px` }} />
    </span>
  );

  const TickerSequence = () => (
    <div
      className="flex items-center justify-around flex-shrink-0"
      style={{ minWidth: '100vw' }}
    >
      {[0, 1, 2, 3].map(i => <SegmentRow key={i} />)}
    </div>
  );

  // Two identical viewport-covering sequences keep content on screen at all times.
  return (
    <div 
      className="fixed left-0 right-0 overflow-hidden"
      style={{ 
        bottom: 0,
        height: tickerHeight,
        backgroundColor: 'var(--board-footer, #1A2B4C)',
        borderTop: '2px solid rgba(255,255,255,0.08)',
        zIndex: 50,
      }}
    >
      <div className="h-full flex items-center">
        <motion.div
          className="flex items-center whitespace-nowrap"
          style={{ direction: 'ltr' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        >
          <TickerSequence />
          <TickerSequence />
        </motion.div>
      </div>
    </div>
  );
}
