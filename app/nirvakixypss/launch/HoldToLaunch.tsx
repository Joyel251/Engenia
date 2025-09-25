"use client"

import { motion } from "motion/react";

interface HoldProps {
  holding: boolean;
  progress: number; // 0..100
  onHoldStart: () => void;
  onHoldCancel: () => void;
  onComplete?: () => void;
}

// Accessible, large "Hold to Launch" button with progress fill.
export default function HoldToLaunch({ holding, progress, onHoldStart, onHoldCancel }: HoldProps) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={onHoldStart}
        onMouseUp={onHoldCancel}
        onTouchStart={onHoldStart}
        onTouchEnd={onHoldCancel}
        onTouchCancel={onHoldCancel}
        onContextMenu={(e) => e.preventDefault()}
        className="relative overflow-hidden inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg sm:text-xl font-bold text-white shadow-lg backdrop-blur hover:bg-white/10 select-none"
        aria-label="Hold to launch"
      >
        <span className="relative z-10">
          {holding ? "Keep Holding..." : "Hold to Launch"}
        </span>
        {/* Progress fill */}
        <motion.span
          className="absolute left-0 top-0 h-full bg-cyan-500/30"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
          aria-hidden="true"
        />
      </button>
      <div className="mt-2 text-center text-xs text-white/70">{pct}%</div>
    </div>
  );
}
