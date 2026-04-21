import React, { useState, useEffect, useRef } from 'react';

function SingleBackground({ bg }) {
  if (!bg || bg.type === 'none') return null;

  const fitStyles = {
    cover:   { backgroundSize: 'cover',   backgroundPosition: 'center', backgroundRepeat: 'no-repeat' },
    contain: { backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' },
    stretch: { backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' },
    center:  { backgroundSize: 'auto',    backgroundPosition: 'center', backgroundRepeat: 'no-repeat' },
  };

  const isWatermark = bg.displayMode === 'watermark';
  const opacity = bg.opacity ?? (isWatermark ? 0.25 : 1);

  const baseStyle = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    opacity,
    zIndex: isWatermark ? 5 : 1,
    pointerEvents: 'none',
  };

  if (bg.type === 'image' && bg.imageUrl) {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundImage: `url(${bg.imageUrl})`,
          ...fitStyles[bg.fitMode || 'cover'],
        }}
      />
    );
  }

  if (bg.type === 'html' && bg.htmlContent) {
    return (
      <iframe
        srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;height:100%;overflow:hidden;}</style></head><body>${bg.htmlContent}</body></html>`}
        style={{ ...baseStyle, border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
        title="custom-background"
      />
    );
  }

  return null;
}

/**
 * BackgroundLayer
 * onCurrentBgChange(bg) — called whenever the active displayed background changes
 */
export default function BackgroundLayer({ settings, onCurrentBgChange }) {
  const backgrounds = settings?.backgrounds || [];
  const rotationEnabled = settings?.backgroundRotationEnabled !== false;

  const activeBgs = backgrounds.filter(b => b.active !== false);

  const [currentId, setCurrentId] = useState(() => activeBgs[0]?.id || null);
  const timerRef = useRef(null);

  // Reset to first if current was removed
  useEffect(() => {
    const stillExists = activeBgs.some(b => b.id === currentId);
    if (!stillExists && activeBgs.length > 0) {
      setCurrentId(activeBgs[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBgs.map(b => b.id).join(',')]);

  // Rotation timer
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!rotationEnabled || activeBgs.length <= 1) return;

    const currentBg = activeBgs.find(b => b.id === currentId) || activeBgs[0];
    const duration = (currentBg?.durationSeconds || 30) * 1000;

    timerRef.current = setTimeout(() => {
      setCurrentId(prev => {
        const idx = activeBgs.findIndex(b => b.id === prev);
        const nextIdx = (idx + 1) % activeBgs.length;
        return activeBgs[nextIdx]?.id || activeBgs[0]?.id;
      });
    }, duration);

    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, rotationEnabled, activeBgs.map(b => b.id + b.durationSeconds).join(',')]);

  const bg = activeBgs.find(b => b.id === currentId) || activeBgs[0] || null;

  // Notify parent about current background
  useEffect(() => {
    onCurrentBgChange?.(bg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg?.id, bg?.displayMode, bg?.type]);

  if (!bg || bg.type === 'none') return null;

  return <SingleBackground bg={bg} />;
}