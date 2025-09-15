"use client";

import LightRays from "@/components/light-rays";
import BlurText from "@/components/blur-text";

export default function SplashScreen() {
  const handleAnimationComplete = () => {
    console.log("Engenia 2K25 animation completed!");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
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
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center px-4">
          <BlurText
            text="ENGENIA 2K25"
            delay={150}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white tracking-wider"
            stepDuration={0.4}
            easing={(t: number) => 1 - Math.pow(1 - t, 3)}
          />
        </div>
      </div>
    </div>
  );
}