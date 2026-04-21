import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor } from 'lucide-react';
import Display from '@/pages/Display';

// 60" screen is typically 1920x1080 logical pixels
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

export default function DisplayPreviewModal({ open, onClose }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!open) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availW = rect.width - 32; // padding
      const availH = rect.height - 32;
      const scaleW = availW / TARGET_WIDTH;
      const scaleH = availH / TARGET_HEIGHT;
      const s = Math.min(scaleW, scaleH);
      setScale(s);
      setContainerSize({ w: availW, h: availH });
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [open]);

  if (!open) return null;

  const previewW = TARGET_WIDTH * scale;
  const previewH = TARGET_HEIGHT * scale;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">תצוגה מקדימה — כמו מסך 60 אינץ'</span>
            <span className="text-gray-400 text-sm">
              (מוצג ב-{Math.round(scale * 100)}% מגודל המסך האמיתי)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden p-4"
        >
          <div
            style={{
              width: previewW,
              height: previewH,
              position: 'relative',
              boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.1)',
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Scale wrapper — shrinks the entire Display page to fit */}
            <div
              style={{
                width: TARGET_WIDTH,
                height: TARGET_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              <Display previewMode={true} />
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="shrink-0 text-center py-2 text-gray-500 text-xs bg-gray-900 border-t border-gray-700">
          התצוגה המקדימה משקפת את המצב הנוכחי בזמן אמת • לחץ Esc לסגירה
        </div>
      </motion.div>
    </AnimatePresence>
  );
}