import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeafIcon from './LeafIcon';

const noticeStyles = `
  .notice-content { overflow: hidden; }
  .notice-content p { margin: 0.3em 0; }
  .notice-content h1 { font-size: 1.5em; font-weight: 700; margin: 0.35em 0; }
  .notice-content h2 { font-size: 1.25em; font-weight: 700; margin: 0.35em 0; }
  .notice-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.25em 0; }
  .notice-content ul, .notice-content ol { margin: 0.3em 0; padding-right: 1.5em; }
  .notice-content li { margin: 0.2em 0; }
  .notice-content strong { font-weight: 700; }
  .notice-content * { max-width: 100%; overflow-wrap: break-word; word-break: break-word; }
  /* Preserve text alignment from HTML content */
  .notice-content *[style*="text-align: center"], .notice-content center { text-align: center !important; }
  .notice-content *[style*="text-align: left"], .notice-content *[style*="text-align:left"] { text-align: left !important; }
  .notice-content *[style*="text-align: right"], .notice-content *[style*="text-align:right"] { text-align: right !important; }
  /* Quill editor alignment classes */
  .notice-content .ql-align-center { text-align: center !important; }
  .notice-content .ql-align-left { text-align: left !important; }
  .notice-content .ql-align-right { text-align: right !important; }
`;

// PDF container that hides scroll by oversizing + clipping
function PdfEmbed({ url, style = {} }) {
  const clean = url.split('#')[0] + '#toolbar=0&navpanes=0&scrollbar=0&view=Fit';
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <iframe
        src={clean}
        style={{
          position: 'absolute',
          top: 0,
          left: '-2px',
          width: 'calc(100% + 20px)',
          height: 'calc(100% + 20px)',
          border: 'none',
          background: 'white',
        }}
        title="pdf"
        scrolling="no"
      />
    </div>
  );
}

// Scrolling text block — auto-scrolls if content overflows
function ScrollingContent({ children, containerStyle = {}, className = '' }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollDist, setScrollDist] = useState(0);

  useEffect(() => {
    const check = () => {
      if (contentRef.current && containerRef.current) {
        const overflow = contentRef.current.scrollHeight - containerRef.current.clientHeight;
        setScrollDist(overflow > 10 ? overflow : 0);
      }
    };
    // slight delay for render
    const t = setTimeout(check, 150);
    return () => clearTimeout(t);
  }, [children]);

  const duration = scrollDist > 0 ? Math.max(6, scrollDist / 30) : 0;

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', flex: '1 1 0', minHeight: 0, ...containerStyle }}>
      <motion.div
        ref={contentRef}
        animate={scrollDist > 0
          ? { y: [0, 0, -scrollDist, -scrollDist, 0] }
          : { y: 0 }
        }
        transition={scrollDist > 0
          ? { duration: duration + 3, repeat: Infinity, ease: 'linear', times: [0, 0.05, 0.9, 0.95, 1] }
          : {}
        }
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function NoticeCard({ 
  notice, 
  screenScale = 1,
  isFullScreen = false,
  cardOpacity = 88,
  noticeFontScale = 1.0,
  noticeContentScale = 1.0
}) {
  const daysRemaining = useMemo(() => {
    if (!notice?.targetDate) return null;
    const target = new Date(notice.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [notice?.targetDate]);

  if (!notice) return null;

  // Full-screen overlay
  if (isFullScreen) {
    return (
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(24, 35, 60, 0.96)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        <style>{noticeStyles}</style>
        {notice.pdfUrl ? (
          <PdfEmbed url={notice.pdfUrl} style={{ width: '88vw', height: '88vh', borderRadius: '16px' }} />
        ) : (
          <div className="text-center text-white max-w-5xl px-12">
            <h1 className="font-bold mb-8" style={{ fontSize: `${68 * screenScale * noticeFontScale}px`, lineHeight: 1.2 }}>
              {notice.title}
            </h1>
            <div 
              className="leading-relaxed opacity-90 notice-content"
              style={{ fontSize: `${36 * screenScale * noticeContentScale}px`, lineHeight: 1.65 }}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
            {daysRemaining !== null && (
              <div className="mt-12 inline-block px-8 py-4 bg-white/10 rounded-2xl" style={{ fontSize: `${30 * screenScale}px` }}>
                {daysRemaining === 0 ? 'היום!' : `עוד ${daysRemaining} ימים`}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Card view
  return (
    <motion.div 
      className="rounded-3xl h-full relative flex flex-col"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden',
        backgroundColor: `rgba(255,255,255,${cardOpacity / 100})`,
        padding: (notice.pdfUrl || notice.imageUrl && !notice.content) ? 0 : `${36 * screenScale}px`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <style>{noticeStyles}</style>

      {notice.pdfUrl ? (
        <div className="flex-1 flex items-center justify-center" style={{ padding: `${16 * screenScale}px` }}>
          <PdfEmbed 
            url={notice.pdfUrl} 
            style={{ 
              width: '100%', 
              height: '100%',
              borderRadius: `${16 * screenScale}px`,
            }} 
          />
        </div>
      ) : notice.imageUrl && !notice.content ? (
        <div className="flex-1 flex items-center justify-center" style={{ padding: `${16 * screenScale}px` }}>
          <img
            src={notice.imageUrl}
            alt={notice.title || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: `${16 * screenScale}px`,
            }}
          />
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col min-h-0" style={{ maxHeight: '100%' }}>
          {/* Title — fixed, never scrolled */}
          <h2 
            className="text-primary font-bold flex-shrink-0"
            style={{ 
              fontSize: `${72 * screenScale * noticeFontScale}px`, 
              lineHeight: 1.2,
              marginBottom: `${12 * screenScale}px`,
            }}
          >
            {notice.title}
          </h2>
          
          {/* Content — auto-scrolls if overflows */}
          <ScrollingContent>
            <div 
              className="text-secondary leading-relaxed notice-content"
              style={{ 
                fontSize: `${44 * screenScale * noticeContentScale}px`,
                lineHeight: 1.65,
              }}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {notice.imageUrl && (
              <div style={{ marginTop: `${16 * screenScale}px` }}>
                <img 
                  src={notice.imageUrl} 
                  alt="" 
                  className="w-full h-auto rounded-xl object-cover"
                  style={{ maxHeight: `${240 * screenScale}px` }}
                />
              </div>
            )}

            {daysRemaining !== null && (
              <div 
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent/10 text-accent rounded-xl"
                style={{ fontSize: `${22 * screenScale}px`, marginTop: `${16 * screenScale}px` }}
              >
                <LeafIcon single size={18 * screenScale} color="#8FAE9B" />
                {daysRemaining === 0 ? 'היום!' : `עוד ${daysRemaining} ימים`}
              </div>
            )}
          </ScrollingContent>
        </div>
      )}
    </motion.div>
  );
}