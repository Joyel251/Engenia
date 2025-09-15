"use client";

import LightRays from "@/components/light-rays";
import BlurText from "@/components/blur-text";
import ShinyText from "@/components/shiny-text";
import { useState } from "react";

export default function SplashScreen() {
  const [showShinyText, setShowShinyText] = useState(false);

  const handleAnimationComplete = () => {
    console.log("Engenia 2K25 animation completed!");
    setShowShinyText(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Light rays background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={1.2}
          lightSpread={1.8}
          rayLength={2.5}
          followMouse={true}
          mouseInfluence={0.2}
          noiseAmount={0}
          distortion={0.05}
          pulsating={false}
          fadeDistance={0.7}
          saturation={1.1}
          className="w-full h-full"
        />
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center px-4">
          {!showShinyText ? (
            <BlurText
              text="ENGENIA 2K25"
              delay={150}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-heading font-black text-white tracking-[0.1em] drop-shadow-2xl [text-shadow:0_0_30px_rgba(255,255,255,0.5)] leading-[0.9] select-none"
              stepDuration={0.4}
              easing={(t: number) => 1 - Math.pow(1 - t, 3)}
              threshold={0.1}
            />
          ) : (
            <ShinyText
              text="ENGENIA 2K25"
              disabled={false}
              speed={3}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-heading font-black tracking-[0.1em] drop-shadow-2xl [text-shadow:0_0_30px_rgba(255,255,255,0.5)] leading-[0.9] select-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}