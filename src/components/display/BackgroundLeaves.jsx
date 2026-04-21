import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const LEAF_IMG = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699472baee00632b405a28ce/4c0c22833_Asset.png';

function DriftingLeaf({ startX, startY, size, duration, delay, rotation, opacity, driftX, driftY }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: startX, top: startY, opacity }}
      animate={{
        x: [0, driftX * 0.3, driftX * 0.7, driftX, driftX * 0.5, 0],
        y: [0, driftY * 0.3, driftY * 0.6, driftY, driftY * 0.75, 0],
        rotate: [rotation, rotation + 18, rotation + 5, rotation - 12, rotation + 6, rotation],
        scale: [1, 1.06, 0.96, 1.04, 0.97, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <img src={LEAF_IMG} alt="" style={{ width: size, height: 'auto' }} draggable={false} />
    </motion.div>
  );
}

const leaves = [
  // Large leaves
  { id: 1,  startX: '2%',  startY: '8%',  size: 130, duration: 36, delay: 0,  rotation: -15, opacity: 0.12, driftX: 200,  driftY: 130  },
  { id: 2,  startX: '82%', startY: '6%',  size: 110, duration: 30, delay: 3,  rotation: 22,  opacity: 0.11, driftX: -170, driftY: 160  },
  { id: 3,  startX: '4%',  startY: '58%', size: 120, duration: 42, delay: 6,  rotation: -10, opacity: 0.11, driftX: 220,  driftY: -150 },
  { id: 4,  startX: '78%', startY: '52%', size: 140, duration: 34, delay: 2,  rotation: 15,  opacity: 0.10, driftX: -160, driftY: -120 },
  // Medium leaves
  { id: 5,  startX: '38%', startY: '2%',  size: 80,  duration: 48, delay: 8,  rotation: 5,   opacity: 0.09, driftX: 130,  driftY: 210  },
  { id: 6,  startX: '62%', startY: '75%', size: 95,  duration: 39, delay: 5,  rotation: -18, opacity: 0.10, driftX: -200, driftY: -100 },
  { id: 7,  startX: '17%', startY: '40%', size: 70,  duration: 52, delay: 10, rotation: 12,  opacity: 0.09, driftX: 100,  driftY: -180 },
  { id: 8,  startX: '14%', startY: '20%', size: 100, duration: 44, delay: 1,  rotation: -20, opacity: 0.12, driftX: 230,  driftY: 140  },
  { id: 9,  startX: '70%', startY: '33%', size: 90,  duration: 33, delay: 4,  rotation: 25,  opacity: 0.11, driftX: -150, driftY: 110  },
  { id: 10, startX: '28%', startY: '48%', size: 75,  duration: 41, delay: 9,  rotation: -8,  opacity: 0.10, driftX: 140,  driftY: -200 },
  // Small leaves
  { id: 11, startX: '53%', startY: '70%', size: 55,  duration: 50, delay: 7,  rotation: 12,  opacity: 0.09, driftX: -180, driftY: -110 },
  { id: 12, startX: '46%', startY: '28%', size: 65,  duration: 58, delay: 12, rotation: -5,  opacity: 0.08, driftX: 90,   driftY: 190  },
  { id: 13, startX: '22%', startY: '80%', size: 50,  duration: 43, delay: 11, rotation: 18,  opacity: 0.09, driftX: 240,  driftY: -90  },
  { id: 14, startX: '76%', startY: '10%', size: 60,  duration: 37, delay: 13, rotation: -22, opacity: 0.10, driftX: -110, driftY: 175  },
  { id: 15, startX: '90%', startY: '45%', size: 45,  duration: 55, delay: 15, rotation: 8,   opacity: 0.08, driftX: -130, driftY: -140 },
  { id: 16, startX: '10%', startY: '85%', size: 85,  duration: 47, delay: 14, rotation: -12, opacity: 0.10, driftX: 190,  driftY: -60  },
  { id: 17, startX: '58%', startY: '15%', size: 70,  duration: 63, delay: 16, rotation: 20,  opacity: 0.08, driftX: 60,   driftY: 220  },
  { id: 18, startX: '35%', startY: '65%', size: 55,  duration: 38, delay: 17, rotation: -28, opacity: 0.09, driftX: -210, driftY: 80   },
];

export default function BackgroundLeaves() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large central watermark */}
      <motion.div
        className="absolute"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.07 }}
        animate={{ scale: [1, 1.04, 0.97, 1.03, 1], rotate: [0, 2.5, -1.5, 1.5, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={LEAF_IMG} alt="" style={{ width: 600, height: 'auto' }} draggable={false} />
      </motion.div>

      {leaves.map(leaf => <DriftingLeaf key={leaf.id} {...leaf} />)}
    </div>
  );
}