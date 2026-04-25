import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import NoticeCard from './NoticeCard';

export default function NoticesGallery({ 
  notices = [], 
  rotationSeconds = 20,
  screenScale = 1,
  dualMode = false,
  cardOpacity = 88,
  noticeFontScale = 1.0,
  noticeContentScale = 1.0
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeNotices = notices.filter(n => n.active);

  useEffect(() => {
    setCurrentIndex(0);
  }, [dualMode]);

  useEffect(() => {
    const step = dualMode ? 2 : 1;
    if (activeNotices.length <= step) return;

    // Use per-notice displaySeconds if set, otherwise fallback to global rotationSeconds
    const currentNotice = activeNotices[currentIndex];
    const delay = (currentNotice?.displaySeconds > 0 ? currentNotice.displaySeconds : rotationSeconds) * 1000;

    const timeout = setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + step;
        return next >= activeNotices.length ? 0 : next;
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [activeNotices.length, rotationSeconds, dualMode, currentIndex]);

  if (activeNotices.length === 0) {
    return (
      <div 
        className="h-full flex items-center justify-center bg-white/85 rounded-3xl"
        style={{ boxShadow: 'var(--shadow-soft)' }}
      >
        <p className="text-secondary" style={{ fontSize: `${24 * screenScale}px` }}>
          אין מודעות להצגה
        </p>
      </div>
    );
  }

  const notice1 = activeNotices[currentIndex];
  const notice2 = dualMode ? activeNotices[(currentIndex + 1) % activeNotices.length] : null;

  // In dual mode, show 2 notices side by side
  if (dualMode && activeNotices.length >= 2) {
    const totalPairs = Math.ceil(activeNotices.length / 2);
    const currentPair = Math.floor(currentIndex / 2);
    return (
      <div className="h-full flex flex-col gap-2">
        <AnimatePresence mode="wait">
          <div key={`dual-${currentIndex}`} className="flex gap-4 flex-1 min-h-0 items-stretch">
            <div className="flex-1 min-h-0">
              <NoticeCard notice={notice1} screenScale={screenScale * 0.85} cardOpacity={cardOpacity} noticeFontScale={noticeFontScale} noticeContentScale={noticeContentScale} />
            </div>
            <div className="flex-1 min-h-0">
              <NoticeCard notice={notice2} screenScale={screenScale * 0.85} cardOpacity={cardOpacity} noticeFontScale={noticeFontScale} noticeContentScale={noticeContentScale} />
            </div>
          </div>
        </AnimatePresence>

        {totalPairs > 1 && (
          <div className="flex items-center justify-center gap-3 flex-shrink-0 pb-1">
            <div className="flex gap-1.5 items-center">
              {Array.from({ length: totalPairs }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-full transition-all duration-300"
                  style={{ 
                    width: idx === currentPair ? `${20 * screenScale}px` : `${8 * screenScale}px`,
                    height: `${8 * screenScale}px`,
                    backgroundColor: idx === currentPair ? 'var(--primary)' : 'var(--neutral)'
                  }}
                />
              ))}
            </div>
            <span className="text-secondary font-medium" style={{ fontSize: `${22 * screenScale}px`, opacity: 0.8 }}>
              {currentIndex + 1}–{Math.min(currentIndex + 2, activeNotices.length)} מתוך {activeNotices.length}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="wait">
          <NoticeCard 
            key={notice1?.id || currentIndex}
            notice={notice1} 
            screenScale={screenScale}
            cardOpacity={cardOpacity}
            noticeFontScale={noticeFontScale}
            noticeContentScale={noticeContentScale}
          />
        </AnimatePresence>
      </div>

      {/* Notice counter: מודעה X מתוך Y */}
      {activeNotices.length > 1 && (
        <div className="flex items-center justify-center gap-3 flex-shrink-0 pb-1">
          <div className="flex gap-1.5 items-center">
            {activeNotices.map((_, idx) => (
              <div
                key={idx}
                className="rounded-full transition-all duration-300"
                style={{ 
                  width: idx === currentIndex ? `${20 * screenScale}px` : `${8 * screenScale}px`,
                  height: `${8 * screenScale}px`,
                  backgroundColor: idx === currentIndex ? 'var(--primary)' : 'var(--neutral)'
                }}
              />
            ))}
          </div>
          <span 
            className="text-secondary font-medium"
            style={{ fontSize: `${24 * screenScale}px`, opacity: 0.85 }}
          >
            מודעה {currentIndex + 1} מתוך {activeNotices.length}
          </span>
        </div>
      )}
    </div>
  );
}