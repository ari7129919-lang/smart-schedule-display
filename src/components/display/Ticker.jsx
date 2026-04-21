import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function parseTickerSegments(text) {
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: match[1], highlight: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }
  return parts;
}

export default function Ticker({ 
  text = 'מח ולב | 072-2351290 | ראשון-חמישי',
  screenScale = 1 
}) {
  const segments = useMemo(() => parseTickerSegments(text), [text]);
  const fontSize = `${30 * screenScale}px`;
  const tickerHeight = `${80 * screenScale}px`;

  const SegmentRow = () => (
    <span className="inline-flex items-center flex-shrink-0">
      {segments.map((seg, i) => (
        <span
          key={i}
          style={{
            fontSize,
            fontWeight: seg.highlight ? '800' : '400',
            color: seg.highlight ? '#ffffff' : 'rgba(255,255,255,0.6)',
            letterSpacing: seg.highlight ? '0.02em' : 'normal',
          }}
        >
          {seg.text}
        </span>
      ))}
      <span style={{ fontSize, color: 'rgba(255,255,255,0.25)', margin: `0 ${40 * screenScale}px` }}>
        ◆
      </span>
    </span>
  );

  // RTL ticker: Hebrew text should scroll from left to right (positive x direction)
  // We duplicate content and animate from -50% to 0 so it loops seamlessly left→right
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
      style={{ 
        height: tickerHeight,
        backgroundColor: '#1A2640',
        borderTop: '2px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="h-full flex items-center">
        <motion.div
          className="flex items-center whitespace-nowrap"
          style={{ direction: 'ltr' }}
          animate={{ x: ['-50%', '0%'] }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <SegmentRow key={i} />)}
        </motion.div>
      </div>
    </div>
  );
}