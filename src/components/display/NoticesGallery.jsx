import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import NoticeCard from './NoticeCard';

export default function NoticesGallery({ 
  notices = [], 
  rotationSeconds = 20,
  screenScale = 1,
  cardOpacity = 88,
  noticeFontScale = 1.0,
  noticeContentScale = 1.0,
  dualMode = false
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeNotices = notices.filter(n => n.active);

  // Build display slots based on dualMode setting and per-notice layout
  const displaySlots = useMemo(() => {
    console.log('[NoticesGallery] dualMode:', dualMode, 'activeNotices:', activeNotices.map(n => ({ id: n.id, title: n.title?.substring(0, 20), layout: n.layout })));
    const slots = [];
    let i = 0;
    while (i < activeNotices.length) {
      const notice = activeNotices[i];
      // Only pair notices if global dualMode is enabled AND this notice has layout='dual'
      if (dualMode && notice.layout === 'dual' && i + 1 < activeNotices.length) {
        console.log('[NoticesGallery] Creating dual slot for:', notice.title, '+', activeNotices[i + 1].title);
        slots.push({
          type: 'dual',
          notices: [notice, activeNotices[i + 1]],
          indices: [i, i + 1]
        });
        i += 2;
      } else {
        // Single notice slot (either global dualMode is off, or this notice is single)
        slots.push({
          type: 'single',
          notices: [notice],
          indices: [i]
        });
        i += 1;
      }
    }
    console.log('[NoticesGallery] displaySlots:', slots.length, slots.map(s => s.type));
    return slots;
  }, [activeNotices, dualMode]);

  // Reset index when notices or dualMode change
  useEffect(() => {
    setCurrentIndex(0);
  }, [notices, dualMode]);

  // Auto-rotation timer
  useEffect(() => {
    if (displaySlots.length <= 1) return;

    const currentSlot = displaySlots[currentIndex];
    // Use the first notice's displaySeconds if set
    const firstNotice = currentSlot.notices[0];
    const delay = (firstNotice?.displaySeconds > 0 ? firstNotice.displaySeconds : rotationSeconds) * 1000;

    const timeout = setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        return next >= displaySlots.length ? 0 : next;
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [displaySlots, currentIndex, rotationSeconds, dualMode]);

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

  const currentSlot = displaySlots[currentIndex];
  const isDual = currentSlot.type === 'dual';
  const notice1 = currentSlot.notices[0];
  const notice2 = isDual ? currentSlot.notices[1] : null;

  // Calculate progress indicators
  const firstIndex = currentSlot.indices[0];
  const lastIndex = currentSlot.indices[currentSlot.indices.length - 1];

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="wait">
          {isDual ? (
            // Dual mode - two notices stacked vertically (top/bottom)
            <div key={`dual-${currentIndex}`} className="flex flex-col gap-4 flex-1 min-h-0 h-full">
              <div className="flex-1 min-h-0">
                <NoticeCard 
                  notice={notice1} 
                  screenScale={screenScale * 0.85} 
                  cardOpacity={cardOpacity} 
                  noticeFontScale={noticeFontScale} 
                  noticeContentScale={noticeContentScale} 
                />
              </div>
              <div className="flex-1 min-h-0">
                <NoticeCard 
                  notice={notice2} 
                  screenScale={screenScale * 0.85} 
                  cardOpacity={cardOpacity} 
                  noticeFontScale={noticeFontScale} 
                  noticeContentScale={noticeContentScale} 
                />
              </div>
            </div>
          ) : (
            // Single mode
            <NoticeCard 
              key={notice1?.id || currentIndex}
              notice={notice1} 
              screenScale={screenScale}
              cardOpacity={cardOpacity}
              noticeFontScale={noticeFontScale}
              noticeContentScale={noticeContentScale}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      {displaySlots.length > 1 && (
        <div className="flex items-center justify-center gap-3 flex-shrink-0 pb-1">
          <div className="flex gap-1.5 items-center">
            {displaySlots.map((_, idx) => (
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
            style={{ fontSize: `${22 * screenScale}px`, opacity: 0.85 }}
          >
            {firstIndex + 1}{isDual ? `–${lastIndex + 1}` : ''} מתוך {activeNotices.length}
          </span>
        </div>
      )}
    </div>
  );
}