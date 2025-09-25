"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import nextDynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";

const Hyperspeed = nextDynamic(() => import("@/components/Hyperspeed"), { ssr: false });
import { hyperspeedPresets } from "@/components/hyperspeed-presets";
import HoldToLaunch from "./HoldToLaunch";

export default function AdminLaunchPage() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [showHyper, setShowHyper] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const router = useRouter();
  const holdRAF = useRef<number | null>(null);
  const holdStart = useRef<number | null>(null);
  const holdingRef = useRef<boolean>(false);
  const HOLD_DURATION = 1500; // ms

  useEffect(() => {
    // Prewarm confetti canvas for smoother first burst
    confetti({ particleCount: 0 });
  }, []);

  const handleLaunch = () => {
    setIsLaunching(true);
    setShowHyper(true);
    setHoldProgress(0);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Clean design: show heading and errors only before launch */}
        {!isLaunching && !launched && (
          <>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="sr-only"
            >
              Launch Website
            </motion.h1>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 mb-4"
              >
                {error}
              </motion.div>
            )}
          </>
        )}

        {/* Launch button */}
        {!isLaunching && !launched && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLaunch}
            className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-xl font-extrabold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/15"
          >
            <span aria-hidden="true"></span>
            Launch Website
          </motion.button>
        )}

        {/* Fullscreen Hyperspeed overlay (runs only during launch) */}
        <AnimatePresence>
          {isLaunching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showHyper ? 1 : 0 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
            >
              {showHyper && (
                <div className="h-full w-full pointer-events-none">
                  <Hyperspeed boost={holding} effectOptions={hyperspeedPresets.one} />
                </div>
              )}

              {/* Hold-to-Engage Button (center) */}
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
                <HoldToLaunch
                  holding={holding}
                  progress={holdProgress}
                  onHoldStart={() => {
                    if (!holdingRef.current) {
                      setHolding(true)
                      holdingRef.current = true
                      holdStart.current = performance.now()
                      const step = () => {
                        if (!holdingRef.current) return
                        const now = performance.now()
                        const start = holdStart.current ?? now
                        const p = Math.min(1, (now - start) / HOLD_DURATION)
                        setHoldProgress(Math.round(p * 100))
                        if (p >= 1) {
                          // Completed
                          setHolding(false)
                          holdingRef.current = false
                          setHoldProgress(100)
                          // Confetti barrage - full screen coverage
                          for (let i = 0; i < 5; i++) {
                            setTimeout(() => {
                              confetti({
                                particleCount: 120,
                                spread: 70 + i * 15,
                                angle: 60 + i * 5,
                                origin: { x: Math.random() * 0.6 + 0.2, y: 0.8 - i * 0.12 },
                                scalar: 1.1,
                                ticks: 200,
                                colors: ["#ffffff", "#00e5ff", "#b388ff", "#80ffea", "#ffe57f"],
                              })
                            }, i * 200)
                          }
                          // Mark launched in backend
fetch("/api/launchstatus", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ launched: true }) }).catch(() => {})
                          setTimeout(() => setShowHyper(false), 600)
                          setTimeout(() => setShowSpinner(true), 800)
                          setTimeout(() => router.push("/"), 1600)
                          return
                        }
                        holdRAF.current = requestAnimationFrame(step)
                      }
                      holdRAF.current = requestAnimationFrame(step)
                    }
                  }}
                  onHoldCancel={() => {
                    setHolding(false)
                    holdingRef.current = false
                    if (holdRAF.current) cancelAnimationFrame(holdRAF.current)
                    holdRAF.current = null
                    holdStart.current = null
                    setHoldProgress(0)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spinner overlay while navigating */}
        <AnimatePresence>
          {showSpinner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-white/10 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
