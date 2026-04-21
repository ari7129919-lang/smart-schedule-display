import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

export default function InternalCircle({ 
  names = [], 
  screenScale = 1,
  displayMode = 'all'  // 'all' = scrolling list, 'range_only' = show first & last only
}) {
  const sortedNames = useMemo(() => {
    if (!names || names.length === 0) return [];
    return [...names].sort((a, b) => a.localeCompare(b, 'he'));
  }, [names]);

  const range = useMemo(() => {
    if (sortedNames.length === 0) return '';
    return `${sortedNames[0]} – ${sortedNames[sortedNames.length - 1]}`;
  }, [sortedNames]);

  const displayNames = sortedNames.length > 0
    ? [...sortedNames, ...sortedNames, ...sortedNames]
    : [];

  const itemHeight = 44 * screenScale;
  const gap = 8 * screenScale;
  const totalHeight = sortedNames.length * (itemHeight + gap);
  const scrollDuration = Math.max(sortedNames.length * 1.8, 8);

  if (sortedNames.length === 0) {
    return (
      <div 
        className="bg-white/85 rounded-3xl flex-1 overflow-hidden flex flex-col"
        style={{ boxShadow: 'var(--shadow-soft)', padding: `${24 * screenScale}px` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <LeafIcon single size={20 * screenScale} color="#7A86A8" />
          <h3 className="text-primary font-semibold" style={{ fontSize: `${26 * screenScale}px` }}>
            מעגל פנימי – ותיקים
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-secondary" style={{ fontSize: `${18 * screenScale}px` }}>אין שמות</p>
        </div>
      </div>
    );
  }

  // Range-only mode: show first and last name as static display
  if (displayMode === 'range_only') {
    return (
      <div 
        className="bg-white/85 rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: 'var(--shadow-soft)', padding: `${24 * screenScale}px` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <LeafIcon single size={20 * screenScale} color="#7A86A8" />
          <h3 className="text-primary font-semibold" style={{ fontSize: `${26 * screenScale}px` }}>
            מעגל פנימי – ותיקים
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          <div 
            className="text-center bg-accent/10 rounded-xl"
            style={{ padding: `${14 * screenScale}px ${16 * screenScale}px` }}
          >
            <div className="text-secondary" style={{ fontSize: `${14 * screenScale}px`, marginBottom: `${4 * screenScale}px` }}>
              ראשון
            </div>
            <div className="text-primary font-bold" style={{ fontSize: `${30 * screenScale}px` }}>
              {sortedNames[0]}
            </div>
          </div>
          <div 
            className="text-center bg-primary/8 rounded-xl"
            style={{ padding: `${14 * screenScale}px ${16 * screenScale}px`, backgroundColor: 'rgba(47,69,128,0.06)' }}
          >
            <div className="text-secondary" style={{ fontSize: `${14 * screenScale}px`, marginBottom: `${4 * screenScale}px` }}>
              אחרון
            </div>
            <div className="text-primary font-bold" style={{ fontSize: `${30 * screenScale}px` }}>
              {sortedNames[sortedNames.length - 1]}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full scroll mode (default)
  return (
    <div 
      className="bg-white/85 rounded-3xl flex-1 overflow-hidden flex flex-col"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <LeafIcon single size={20 * screenScale} color="#7A86A8" />
        <h3 className="text-primary font-semibold" style={{ fontSize: `${26 * screenScale}px` }}>
          מעגל פנימי – ותיקים
        </h3>
      </div>
      
      {range && (
        <div 
          className="text-accent font-medium mb-3 text-center bg-accent/10 rounded-xl py-2 px-3"
          style={{ fontSize: `${20 * screenScale}px` }}
        >
          {range}
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 z-10 h-8 bg-gradient-to-b from-white/85 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 z-10 h-8 bg-gradient-to-t from-white/85 to-transparent pointer-events-none" />
        
        <motion.div
          animate={{ y: [0, -totalHeight] }}
          transition={{
            duration: scrollDuration,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop'
          }}
        >
          {displayNames.map((name, idx) => (
            <div 
              key={idx}
              className="text-secondary text-center rounded-xl bg-neutral/30"
              style={{ 
                fontSize: `${22 * screenScale}px`,
                fontWeight: 500,
                padding: `${6 * screenScale}px ${10 * screenScale}px`,
                marginBottom: `${gap}px`,
                height: `${itemHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}