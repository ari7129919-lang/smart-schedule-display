import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

export default function Congratulations({ 
  items = [], 
  screenScale = 1 
}) {
  // Remove duplicates based on name
  const uniqueItems = useMemo(() => {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  }, [items]);

  const duplicatedItems = [...uniqueItems, ...uniqueItems, ...uniqueItems];

  if (uniqueItems.length === 0) {
    return (
      <div 
        className="bg-white/85 rounded-3xl overflow-hidden"
        style={{ 
          boxShadow: 'var(--shadow-soft)',
          padding: `${24 * screenScale}px`
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <LeafIcon single size={20 * screenScale} color="#8FAE9B" />
          <h3 
            className="text-primary font-medium"
            style={{ fontSize: `${26 * screenScale}px` }}
          >
            ברכת מזל טוב לידידנו
          </h3>
        </div>
        <div className="text-secondary text-center py-4">אין ברכות להצגה</div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/85 rounded-3xl overflow-hidden"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LeafIcon single size={20 * screenScale} color="#8FAE9B" />
        <h3 
        className="text-primary font-medium"
        style={{ fontSize: `${26 * screenScale}px` }}
        >
        ברכת מזל טוב לידידנו
        </h3>
      </div>

      {/* Vertical scrolling */}
      <div 
        className="overflow-hidden relative"
        style={{ height: `${200 * screenScale}px` }}
      >
        <motion.div
          className="space-y-3"
          animate={{ y: ['0%', '-33.33%'] }}
          transition={{
            duration: uniqueItems.length * 5,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {duplicatedItems.map((item, idx) => (
            <div 
              key={idx}
              className="bg-accent/5 rounded-xl p-3 border-r-4 border-accent"
            >
              <div 
                className="text-primary font-medium"
                style={{ fontSize: `${22 * screenScale}px` }}
                >
                {item.name}
                </div>
                {item.message && (
                <div 
                  className="text-secondary mt-1"
                  style={{ fontSize: `${18 * screenScale}px` }}
                >
                  {item.message}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}