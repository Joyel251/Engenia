"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function AdminLaunchPage() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showRocket, setShowRocket] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLaunch = () => {
    setCountdown(5);
    let current = 5;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current === 0) {
        clearInterval(interval);
        setShowRocket(true);
        // Multiple confetti blasts
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 80 + i * 20,
              origin: { x: Math.random(), y: 0.7 - i * 0.1 },
              colors: ["#ff0", "#0ff", "#f0f", "#fff", "#f00", "#0f0", "#00f"]
            });
          }, i * 300);
        }
        setTimeout(async () => {
          try {
            const res = await fetch("/api/launch-status", { method: "POST" });
            if (res.ok) {
              setLaunched(true);
              setTimeout(() => {
                router.push("/home");
              }, 1200);
            } else {
              setError("Failed to launch website.");
            }
          } catch {
            setError("Failed to launch website.");
          }
        }, 1800);
      }
    }, 1000);
  };

  if (launched) return <div className="text-center mt-20 text-2xl">Website Launched!</div>;

  return (
    <div className="theme flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">Launch Website</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {countdown === null && !showRocket && (
        <button
          className="px-8 py-3 bg-blue-600 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition"
          onClick={handleLaunch}
        >
          Launch 🚀
        </button>
      )}
      {countdown !== null && countdown > 0 && (
        <div className="countdown text-6xl font-extrabold animate-pulse mt-8">{countdown}</div>
      )}
      {showRocket && (
        <div className="mt-8 flex flex-col items-center"></div>
      )}
    </div>
  );
}
