import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeafIcon from './LeafIcon';
import { Gift, ExternalLink } from 'lucide-react';

export default function Congratulations({ 
  items = [], 
  screenScale = 1,
  ctaEnabled = false,
  ctaText = '',
  ctaLink = '',
  rotationSeconds = 60
}) {
  const [showCTA, setShowCTA] = useState(false);

  // Toggle between congratulations and CTA based on rotation interval
  useEffect(() => {
    if (!ctaEnabled || !ctaText) {
      setShowCTA(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCTA(prev => !prev);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [ctaEnabled, ctaText, rotationSeconds]);

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
  const hasItems = uniqueItems.length > 0;

  // CTA Block Component
  const CTABlock = () => (
    <motion.div
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="h-full flex flex-col items-center justify-center text-center p-4"
      style={{ perspective: '1000px' }}
    >
      <div 
        className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 border-2 border-accent/30 w-full h-full flex flex-col items-center justify-center"
        style={{ 
          boxShadow: '0 8px 32px rgba(143, 174, 155, 0.15)',
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div
          animate={{ 
            rotateY: [0, 360],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Gift 
            size={48 * screenScale} 
            color="#8FAE9B" 
            strokeWidth={1.5}
          />
        </motion.div>
        <div 
          className="text-primary font-medium mt-4 leading-relaxed"
          style={{ fontSize: `${22 * screenScale}px` }}
          dangerouslySetInnerHTML={{ __html: ctaText.replace(/\n/g, '<br/>') }}
        />
        {ctaLink && (
          <a 
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-accent hover:text-primary transition-colors"
            style={{ fontSize: `${16 * screenScale}px` }}
          >
            <ExternalLink size={14 * screenScale} />
            <span>לחץ כאן</span>
          </a>
        )}
      </div>
    </motion.div>
  );

  // Empty Congratulations State
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
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
      <div className="text-secondary text-center py-4 flex-1 flex items-center justify-center">
        אין ברכות להצגה
      </div>
    </motion.div>
  );

  // Congratulations List
  const CongratsList = () => (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="h-full flex flex-col"
      style={{ perspective: '1000px' }}
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
        className="overflow-hidden relative flex-1"
        style={{ minHeight: `${200 * screenScale}px` }}
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
    </motion.div>
  );

  return (
    <div 
      className="bg-white/85 rounded-3xl overflow-hidden"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`,
        minHeight: `${280 * screenScale}px`,
        perspective: '1000px'
      }}
    >
      <AnimatePresence mode="wait">
        {showCTA && ctaEnabled && ctaText ? (
          <CTABlock key="cta" />
        ) : hasItems ? (
          <CongratsList key="congrats" />
        ) : (
          <EmptyState key="empty" />
        )}
      </AnimatePresence>
    </div>
  );
}