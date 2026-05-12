import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const speedDurations = {
  slow: 5,
  normal: 3,
  fast: 1.5,
};

export default function AnimatedImage({
  images = [],
  effects = [],
  speed = 'normal',
  glowColor = '#8FAE9B',
  screenScale = 1,
  style = {},
  className = '',
  alt = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = useMemo(() => {
    return images.filter(Boolean);
  }, [images]);

  // Slideshow timer — change image every speed duration
  useEffect(() => {
    if (allImages.length <= 1) return;
    const duration = (speedDurations[speed] || 3) * 1000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, duration);
    return () => clearInterval(interval);
  }, [allImages.length, speed]);

  const currentImage = allImages[currentIndex] || allImages[0];

  // Build animation object based on selected effects
  const animate = useMemo(() => {
    const result = {};

    if (effects.includes('flip')) {
      result.rotateY = [0, 180, 360];
    }

    if (effects.includes('zoom')) {
      result.scale = [1, 1.08, 1];
    }

    if (effects.includes('pulse')) {
      // If zoom already controls scale, pulse controls opacity only
      if (!effects.includes('zoom')) {
        result.scale = [1, 1.05, 1];
      }
      result.opacity = [1, 0.85, 1];
    }

    if (effects.includes('glow-border')) {
      result.boxShadow = [
        `0 0 10px ${glowColor}40`,
        `0 0 30px ${glowColor}99`,
        `0 0 10px ${glowColor}40`,
      ];
    }

    return result;
  }, [effects, glowColor]);

  const transition = useMemo(() => {
    const duration = speedDurations[speed] || 3;
    return {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    };
  }, [speed]);

  if (allImages.length === 0) return null;

  return (
    <div
      style={{ perspective: effects.includes('flip') ? '1000px' : undefined, ...style }}
      className={className}
    >
      <motion.div
        animate={animate}
        transition={transition}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: effects.includes('flip') ? 'preserve-3d' : undefined,
          borderRadius: `${16 * screenScale}px`,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={alt}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: `${16 * screenScale}px`,
              display: 'block',
            }}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
