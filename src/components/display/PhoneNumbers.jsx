import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

export default function PhoneNumbers({ numbers = [], screenScale = 1 }) {
  const active = numbers
    .filter(n => n.active !== false)
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));

  const containerRef = useRef(null);

  // Calculate item height and total scroll height
  const itemHeight = 75 * screenScale; // approximate height per phone item
  const gap = 10 * screenScale;
  const totalHeight = active.length * (itemHeight + gap);
  const containerHeight = 280 * screenScale;

  // Only animate if content overflows
  const shouldAnimate = totalHeight > containerHeight;
  const scrollDuration = Math.max(active.length * 3, 10); // at least 10 seconds

  if (active.length === 0) return null;

  return (
    <div
      className="bg-white/85 rounded-3xl overflow-hidden flex flex-col"
      style={{ boxShadow: 'var(--shadow-soft)', padding: `${20 * screenScale}px`, height: '100%' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3" style={{ marginBottom: `${12 * screenScale}px`, flexShrink: 0 }}>
        <Phone size={18 * screenScale} style={{ color: '#6C7C94', flexShrink: 0 }} />
        <h3
          className="text-primary font-semibold"
          style={{ fontSize: `${24 * screenScale}px` }}
        >
          מספרים נחוצים
        </h3>
      </div>

      {/* Auto-scrolling phone numbers */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{ minHeight: 0 }}
      >
        {/* Gradient overlays for smooth fade */}
        <div className="absolute top-0 left-0 right-0 z-10 h-4 bg-gradient-to-b from-white/85 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 z-10 h-4 bg-gradient-to-t from-white/85 to-transparent pointer-events-none" />

        <motion.div
          animate={shouldAnimate ? { y: [0, -totalHeight] } : { y: 0 }}
          transition={shouldAnimate ? {
            duration: scrollDuration,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop'
          } : {}}
        >
          {active.map((phone, idx) => (
            <div
              key={phone.id || idx}
              style={{
                padding: `${10 * screenScale}px ${14 * screenScale}px`,
                background: 'rgba(47,62,85,0.05)',
                borderRadius: `${12 * screenScale}px`,
                borderRight: `${3 * screenScale}px solid rgba(47,62,85,0.2)`,
                marginBottom: `${gap}px`,
              }}
            >
              <div
                className="text-secondary"
                style={{ fontSize: `${18 * screenScale}px`, lineHeight: 1.2, marginBottom: `${3 * screenScale}px` }}
              >
                {phone.category && (
                  <span
                    style={{
                      background: 'rgba(47,62,85,0.1)',
                      borderRadius: '6px',
                      padding: `1px ${6 * screenScale}px`,
                      marginLeft: `${6 * screenScale}px`,
                      fontSize: `${12 * screenScale}px`,
                    }}
                  >
                    {phone.category}
                  </span>
                )}
                {phone.label}
              </div>
              <div
                className="text-primary font-bold tabular-nums"
                style={{ fontSize: `${32 * screenScale}px`, letterSpacing: '0.04em', lineHeight: 1.1 }}
                dir="ltr"
              >
                {phone.number}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}