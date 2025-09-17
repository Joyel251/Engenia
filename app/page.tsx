"use client";

import LightRays from "@/components/light-rays";
import BlurText from "@/components/blur-text";
import ShinyText from "@/components/shiny-text";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const [showShinyText, setShowShinyText] = useState(false);
  const [showNavigationPrompt, setShowNavigationPrompt] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Show logo with delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 500);

    return () => {
      clearTimeout(logoTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleAnimationComplete = () => {
    console.log("Engenia 2025 animation completed!");
    setShowShinyText(true);
    
    // Show navigation prompt after a short delay
    setTimeout(() => {
      setShowNavigationPrompt(true);
    }, 1000);
  };

  const handleNavigation = () => {
    setIsTransitioning(true);
    
    // Navigate after transition starts
    setTimeout(() => {
      router.push('/home');
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Static Logo with College Name */}
      <div className={`absolute top-4 sm:top-8 left-4 sm:left-8 z-20 transition-all duration-1000 ease-out ${
        showLogo 
          ? 'opacity-100 transform translate-y-0 scale-100' 
          : 'opacity-0 transform -translate-y-8 scale-90'
      }`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative group">
            <img 
              src="/logo.jpg" 
              alt="ENGENIA Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover shadow-2xl hover:scale-110 transition-transform duration-300 border-2 border-white/20 hover:border-white/40"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </div>
          
          {/* College Name with Shiny Text Effect */}
          <div className="flex flex-col">
            <ShinyText 
              text="Loyola-ICAM College of"
              className="text-white text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wide"
              speed={3}
            />
            <ShinyText 
              text="Engineering and Technology"
              className="text-white text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wide mt-1"
              speed={3}
            />
          </div>
        </div>
      </div>

      {/* Light rays background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={1.2}
          lightSpread={isMobile ? 2.5 : 1.8}
          rayLength={isMobile ? 3.0 : 2.5}
          followMouse={true}
          mouseInfluence={isMobile ? 0.3 : 0.2}
          noiseAmount={0}
          distortion={0.05}
          pulsating={false}
          fadeDistance={isMobile ? 0.8 : 0.7}
          saturation={1.1}
          className="w-full h-full"
        />
      </div>
      
      {/* Main content */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={showNavigationPrompt ? handleNavigation : undefined}
      >
        {/* Centered title */}
        <div className="h-full flex items-center justify-center px-4">
          <div className="text-center">
            {!showShinyText ? (
              <BlurText
                text="ENGENIA 2025"
                delay={150}
                animateBy="letters"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-heading font-black text-white tracking-[0.1em] drop-shadow-2xl [text-shadow:0_0_30px_rgba(255,255,255,0.5)] leading-[0.9] select-none"
                stepDuration={0.4}
                easing={(t: number) => 1 - Math.pow(1 - t, 3)}
                threshold={0.1}
              />
            ) : (
              <ShinyText
                text="ENGENIA 2025"
                disabled={false}
                speed={3}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-heading font-black tracking-[0.1em] drop-shadow-2xl [text-shadow:0_0_30px_rgba(255,255,255,0.5)] leading-[0.9] select-none"
              />
            )}
          </div>
        </div>

        {/* Bottom navigation prompt - moved up for mobile */}
        {showNavigationPrompt && (
          <div className={`absolute left-1/2 transform -translate-x-1/2 animate-fade-in ${
            isMobile ? 'bottom-20 sm:bottom-16' : 'bottom-12'
          }`}>
            {/* Animated dots */}
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            
            <p className="text-white/60 text-xs sm:text-sm tracking-widest uppercase text-center">
              {isMobile ? 'Tap Anywhere to Continue' : 'Click Anywhere to Continue'}
            </p>
          
          </div>
        )}
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-black animate-fade-in" />
      )}
    </div>
  );
}