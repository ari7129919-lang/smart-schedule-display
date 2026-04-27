import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Maximize, Tv } from 'lucide-react';
import Display from '@/pages/Display';

// 60" screen is typically 1920x1080 logical pixels
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

export default function DisplayPreviewModal({ open, onClose }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [fitToScreen, setFitToScreen] = useState(false);

  // Use layout effect for synchronous calculation to avoid flash
  useLayoutEffect(() => {
    if (!open) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availW = Math.max(100, rect.width); // min 100px
      const availH = Math.max(100, rect.height); // min 100px
      
      // Calculate scale to fit the 1920x1080 content within available space
      // Use 0.98 multiplier to ensure nothing gets cut off at edges
      const scaleW = (availW / TARGET_WIDTH) * 0.98;
      const scaleH = (availH / TARGET_HEIGHT) * 0.98;
      const s = Math.min(scaleW, scaleH);
      
      setScale(s);
      setContainerSize({ w: availW, h: availH });
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [open, fitToScreen]);

  if (!open) return null;

  // Calculate dimensions based on mode
  let previewW, previewH, displayScale;
  
  // Ensure we have valid container size, fallback to scale if not ready
  const effectiveScale = (containerSize.w > 0 && containerSize.h > 0) 
    ? Math.min(containerSize.w / TARGET_WIDTH, containerSize.h / TARGET_HEIGHT)
    : scale;
  
  if (fitToScreen) {
    // Fill entire available space - use all available width/height
    displayScale = effectiveScale;
    previewW = TARGET_WIDTH * displayScale;
    previewH = TARGET_HEIGHT * displayScale;
  } else {
    // Simulation mode - same scaling but show info about the scale
    displayScale = effectiveScale;
    previewW = TARGET_WIDTH * displayScale;
    previewH = TARGET_HEIGHT * displayScale;
  }

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
            <span className="text-white font-medium">
              {fitToScreen ? 'תצוגה מקדימה — מסך מלא' : 'תצוגה מקדימה — סימולציית מסך 60 אינץ\''}
            </span>
            {!fitToScreen && (
              <span className="text-gray-400 text-sm">
                (מוצג ב-{Math.round(scale * 100)}% מגודל המסך האמיתי)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFitToScreen(!fitToScreen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title={fitToScreen ? 'switch לסימולציית מסך' : 'switch למסך מלא'}
            >
              {fitToScreen ? <Tv className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              {fitToScreen ? 'סימולציה' : 'מסך מלא'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-4 overflow-visible"
        >
          <div
            style={{
              width: previewW,
              height: previewH,
              position: 'relative',
              boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.1)',
              borderRadius: 8,
              flexShrink: 0,
              overflow: 'visible',
            }}
          >
            {/* Scale wrapper — shrinks the entire Display page to fit */}
            <div
              style={{
                width: TARGET_WIDTH,
                height: TARGET_HEIGHT,
                transform: `scale(${displayScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            >
              <Display previewMode={true} fitToScreen={fitToScreen} />
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