"use client";

import ShinyText from "@/components/shiny-text";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import nextDynamic from 'next/dynamic';

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false });

export default function SplashScreen() {
  const [showNavigationPrompt, setShowNavigationPrompt] = useState(false);
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
    // Show navigation prompt after a short delay
    setTimeout(() => {
      setShowNavigationPrompt(true);
    }, 800);
  };

  const handleNavigation = () => {
    // Navigate immediately without any transition
    router.push('/home');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{backgroundColor: 'transparent'}}>
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#00bcd4" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>

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
          
          {/* No text on splash screen as requested */}
        </div>
      </div>

      {/* Main content */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={showNavigationPrompt ? handleNavigation : undefined}
      >
        {/* Centered title */}
        <div className="h-full flex items-center justify-center px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              onAnimationComplete={handleAnimationComplete}
              className="mx-auto"
            >
              <div className="relative mx-auto w-[220px] sm:w-[320px] md:w-[420px] lg:w-[560px] aspect-[3/1]">
                <Image
                  src="/engenia.png"
                  alt="Engenia"
                  fill
                  sizes="(max-width: 640px) 220px, (max-width: 768px) 320px, (max-width: 1024px) 420px, 560px"
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {showNavigationPrompt && (
          <div className={`absolute left-1/2 transform -translate-x-1/2 animate-fade-in ${
            isMobile ? 'bottom-20 sm:bottom-16' : 'bottom-12'
          }`}>
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

    </div>
  );
}