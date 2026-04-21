import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

const defaultRules = [
  'השקטה פנימית – נא לשמור על שקט באולם',
  'פניות דרך נדרים פלוס',
  'איסור שיתוף תכנים מהסדנא'
];

export default function FixedRules({ 
  rules = defaultRules, 
  screenScale = 1 
}) {
  const displayRules = rules.length > 0 ? rules : defaultRules;
  
  // Duplicate for seamless scroll
  const duplicatedRules = useMemo(() => {
    return [...displayRules, ...displayRules, ...displayRules];
  }, [displayRules]);

  return (
    <div 
      className="bg-white/85 rounded-3xl overflow-hidden"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LeafIcon single size={20 * screenScale} color="#6C7C94" />
        <h3 
          className="text-primary font-medium"
          style={{ fontSize: `${26 * screenScale}px` }}
        >
          מידע והנחיות
        </h3>
      </div>

      {/* Vertical auto-scroll */}
      <div 
        className="overflow-hidden relative"
        style={{ height: `${180 * screenScale}px` }}
      >
        <motion.div
          className="space-y-3"
          animate={{ y: ['0%', '-33.33%'] }}
          transition={{
            duration: displayRules.length * 6,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {duplicatedRules.map((rule, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3"
            >
              <LeafIcon single size={14 * screenScale} color="#D6DCE5" className="mt-1 flex-shrink-0" />
              <p 
                className="text-secondary"
                style={{ fontSize: `${22 * screenScale}px`, lineHeight: 1.5 }}
              >
                {rule}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}