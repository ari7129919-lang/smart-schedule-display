import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeafIcon from './LeafIcon';

export default function SmallGroups({ 
  groups = [], 
  rotationSeconds = 8,
  screenScale = 1 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when groups array itself changes (not just length)
  useEffect(() => {
    setCurrentIndex(0);
  }, [groups]);

  useEffect(() => {
    if (groups.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % groups.length);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [groups, groups.length, rotationSeconds]);

  // Clamp index in case groups shrank between renders
  const safeIndex = groups.length > 0 ? Math.min(currentIndex, groups.length - 1) : 0;
  const currentGroup = groups[safeIndex];

  if (!currentGroup) {
    return (
      <div 
        className="board-card p-6"
        style={{ 
          boxShadow: 'var(--shadow-soft)',
          padding: `${24 * screenScale}px`
        }}
      >
        <div className="text-secondary text-center">אין קבוצות להצגה</div>
      </div>
    );
  }

  return (
    <div 
      className="board-card p-6 flex flex-col overflow-hidden flex-shrink-0"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`,
        height: `${300 * screenScale}px`
      }}
    >
      <div className="board-section-title flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LeafIcon single size={20 * screenScale} color="#7A86A8" />
          <h3 
            className="text-primary font-medium"
            style={{ fontSize: `${26 * screenScale}px` }}
          >
            קבוצות קטנות – ותיקים
          </h3>
        </div>
        <div 
          className="text-secondary"
          style={{ fontSize: `${20 * screenScale}px` }}
        >
          קבוצה {currentIndex + 1} מתוך {groups.length}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div 
              className="text-primary font-medium mb-3"
              style={{ fontSize: `${24 * screenScale}px` }}
            >
              {currentGroup.name}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: currentGroup.members?.length > 7 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                columnGap: `${16 * screenScale}px`,
                rowGap: `${4 * screenScale}px`
              }}
            >
              {currentGroup.members?.map((member, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-secondary min-w-0"
                  style={{ fontSize: `${19 * screenScale}px`, lineHeight: 1.25 }}
                >
                  <span 
                    className="inline-block rounded-full bg-primary flex-shrink-0"
                    style={{ width: `${6 * screenScale}px`, height: `${6 * screenScale}px` }}
                  />
                  <span className="truncate">{member}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
