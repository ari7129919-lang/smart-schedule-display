import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeafIcon from './LeafIcon';

export default function SmallGroups({ 
  groups = [], 
  rotationSeconds = 8,
  screenScale = 1 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (groups.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % groups.length);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [groups.length, rotationSeconds]);

  const currentGroup = groups[currentIndex];

  if (!currentGroup) {
    return (
      <div 
        className="bg-white/85 rounded-3xl p-6"
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
      className="bg-white/85 rounded-3xl p-6"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`
      }}
    >
      <div className="flex items-center justify-between mb-4">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="space-y-2"
        >
          <div 
            className="text-primary font-medium mb-3"
            style={{ fontSize: `${24 * screenScale}px` }}
          >
            {currentGroup.name}
          </div>
          <div className="space-y-1">
            {currentGroup.members?.map((member, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-secondary"
                style={{ fontSize: `${20 * screenScale}px` }}
              >
                <span 
                  className="inline-block rounded-full bg-primary flex-shrink-0"
                  style={{ width: `${6 * screenScale}px`, height: `${6 * screenScale}px` }}
                />
                {member}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}