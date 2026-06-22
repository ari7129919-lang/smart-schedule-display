import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LS_LAST_SHOWN = 'popup_last_shown';

const ANIMATION_VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    exit: { opacity: 0, scale: 0.5 },
  },
};

export default function PopupOverlay({ settings, screenScale = 1 }) {
  const popupConfig = settings?.popupConfig || {};
  const {
    enabled = false,
    content = '',
    title = '',
    imageUrl = '',
    intervalMinutes = 5,
    durationSeconds = 10,
    fontSize = 32,
    textColor = '#FFFFFF',
    bgColor = '#1A2B4C',
    borderColor = '#5FAFA8',
    animation = 'zoom',
    displayMode = 'modal',
  } = popupConfig;

  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const hideTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Keep ref in sync with state
  isVisibleRef.current = isVisible;

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const showPopup = useCallback(() => {
    if (isVisibleRef.current) return; // Already showing
    clearHideTimeout();
    setIsVisible(true);
    localStorage.setItem(LS_LAST_SHOWN, Date.now().toString());

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, (durationSeconds || 10) * 1000);
  }, [durationSeconds, clearHideTimeout]);

  // Effect that runs the interval timer (independent of isVisible state)
  useEffect(() => {
    if (!enabled || !content.trim()) {
      clearHideTimeout();
      setIsVisible(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalMs = (intervalMinutes || 5) * 60 * 1000;

    // Check immediately on mount / config change
    const lastShown = parseInt(localStorage.getItem(LS_LAST_SHOWN) || '0', 10);
    if (Date.now() - lastShown >= intervalMs && !isVisibleRef.current) {
      showPopup();
    }

    intervalRef.current = setInterval(() => {
      const currentLast = parseInt(localStorage.getItem(LS_LAST_SHOWN) || '0', 10);
      if (Date.now() - currentLast >= intervalMs && !isVisibleRef.current) {
        showPopup();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, content, intervalMinutes, showPopup, clearHideTimeout]);

  // Cleanup hide timeout on unmount only (not on every re-render)
  useEffect(() => {
    return () => clearHideTimeout();
  }, [clearHideTimeout]);

  if (!enabled || !content.trim()) return null;

  const variants = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.zoom;
  const scaledFontSize = Math.round((fontSize || 32) * screenScale);

  const contentHtml = { __html: content };

  // --- Modal Mode ---
  if (displayMode === 'modal') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="popup-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          >
            <motion.div
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{ duration: 0.4 }}
              className="relative max-w-3xl w-full mx-6 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: bgColor || '#1A2B4C',
                border: `3px solid ${borderColor || '#5FAFA8'}`,
              }}
            >
              {/* Close hint */}
              <div
                className="absolute top-3 left-3 text-white/40 text-xs select-none"
                style={{ fontSize: `${12 * screenScale}px` }}
              >
                נעלם בעוד {durationSeconds} שניות
              </div>

              <div className="p-8 text-center space-y-4" dir="rtl">
                {title && (
                  <h2
                    className="font-bold leading-tight"
                    style={{
                      fontSize: `${Math.round(scaledFontSize * 1.3)}px`,
                      color: textColor || '#FFFFFF',
                    }}
                  >
                    {title}
                  </h2>
                )}

                {imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Popup"
                      className="rounded-lg object-contain max-h-64"
                      style={{ maxHeight: `${200 * screenScale}px` }}
                    />
                  </div>
                )}

                <div
                  className="leading-relaxed"
                  style={{
                    fontSize: `${scaledFontSize}px`,
                    color: textColor || '#FFFFFF',
                  }}
                  dangerouslySetInnerHTML={contentHtml}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // --- Banner Mode ---
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="popup-banner"
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
          className="fixed top-0 left-0 right-0 z-50 shadow-xl"
          style={{
            backgroundColor: bgColor || '#1A2B4C',
            borderBottom: `4px solid ${borderColor || '#5FAFA8'}`,
          }}
          dir="rtl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Popup"
                className="rounded object-contain flex-shrink-0"
                style={{ height: `${48 * screenScale}px`, width: 'auto' }}
              />
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <div
                  className="font-bold mb-1"
                  style={{
                    fontSize: `${Math.round(scaledFontSize * 0.85)}px`,
                    color: textColor || '#FFFFFF',
                  }}
                >
                  {title}
                </div>
              )}
              <div
                className="leading-snug"
                style={{
                  fontSize: `${scaledFontSize}px`,
                  color: textColor || '#FFFFFF',
                }}
                dangerouslySetInnerHTML={contentHtml}
              />
            </div>
            <div
              className="text-white/40 text-xs flex-shrink-0 select-none"
              style={{ fontSize: `${10 * screenScale}px` }}
            >
              {durationSeconds}s
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
