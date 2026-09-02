import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

const styles = `
  .special-notice-content { overflow-wrap: break-word; word-break: break-word; }
  .special-notice-content p { margin: 0.3em 0; }
  .special-notice-content h1, .special-notice-content h2, .special-notice-content h3 { margin: 0.35em 0; font-weight: 700; }
  .special-notice-content ul, .special-notice-content ol { padding-right: 1.5em; }
  .special-notice-content img, .special-notice-content table { max-width: 100%; }
`;

export default function SpecialNoticesBlock({ notices = [], rotationSeconds = 8, screenScale = 1 }) {
  const activeNotices = useMemo(
    () => notices.filter(notice => notice?.active !== false && !notice?.archived),
    [notices]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => setCurrentIndex(0), [notices]);

  const safeIndex = activeNotices.length ? Math.min(currentIndex, activeNotices.length - 1) : 0;
  const notice = activeNotices[safeIndex];
  const duration = Math.max(1, Number(notice?.displaySeconds || rotationSeconds) || 8);

  useEffect(() => {
    if (activeNotices.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex(index => (index + 1) % activeNotices.length);
    }, duration * 1000);
    return () => clearInterval(timer);
  }, [activeNotices.length, duration]);

  return (
    <div className="board-card flex min-h-0 flex-1 flex-col overflow-hidden" style={{ boxShadow: 'var(--shadow-soft)', padding: `${24 * screenScale}px` }}>
      <style>{styles}</style>
      <div className="board-section-title mb-3 flex items-center gap-2">
        <LeafIcon single size={20 * screenScale} color="#7A86A8" />
        <h3 className="text-primary font-semibold" style={{ fontSize: `${26 * screenScale}px` }}>הודעות מיוחדות</h3>
      </div>
      {!notice ? (
        <div className="flex flex-1 items-center justify-center text-secondary" style={{ fontSize: `${18 * screenScale}px` }}>אין הודעות להצגה</div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={notice.id || safeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="h-full overflow-y-auto"
            >
              <div className="special-notice-content text-primary font-bold" style={{ fontSize: `${28 * screenScale}px`, lineHeight: 1.25 }} dangerouslySetInnerHTML={{ __html: notice.title || '' }} />
              <div className="special-notice-content text-secondary" style={{ fontSize: `${20 * screenScale}px`, lineHeight: 1.55, marginTop: `${14 * screenScale}px` }} dangerouslySetInnerHTML={{ __html: notice.content || '' }} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      {activeNotices.length > 1 && (
        <div className="mt-3 flex shrink-0 items-center justify-center gap-2 text-secondary" style={{ fontSize: `${14 * screenScale}px` }}>
          <span>{safeIndex + 1} מתוך {activeNotices.length}</span>
          <div className="flex gap-1">
            {activeNotices.map((item, index) => <span key={item.id || index} className="rounded-full" style={{ width: `${6 * screenScale}px`, height: `${6 * screenScale}px`, backgroundColor: index === safeIndex ? 'var(--primary)' : 'var(--neutral)' }} />)}
          </div>
        </div>
      )}
    </div>
  );
}
