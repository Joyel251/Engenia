"use client";

import ShinyText from "@/components/shiny-text";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import dynamic from 'next/dynamic';

const Beams = dynamic(() => import('@/components/Beams'), { ssr: false });

interface PageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SplashScreen({ params = {}, searchParams = {} }: PageProps) {
  const [showNavigationPrompt, setShowNavigationPrompt] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [launched, setLaunched] = useState<boolean | null>(null);
  const ignoreLaunchLock = (typeof window !== 'undefined' && window.location.pathname.includes('/nirvakixypss/preview'));
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
    // Fetch launch status (correct endpoint)
    fetch('/api/launchstatus', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setLaunched(!!data.launched))
      .catch(() => setLaunched(false));
    return () => {
      clearTimeout(logoTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  if (launched === false && !ignoreLaunchLock) {
    return (
      <div className="locked-screen flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <p className="text-lg">The website is not launched yet.</p>
      </div>
    );
  }

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


      {/* Main content */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={showNavigationPrompt ? handleNavigation : undefined}
      >
        {/* Centered content with logo above - slightly higher position */}
        <div className="h-full flex items-center justify-center px-4">
          <div className="text-center transform -translate-y-8 sm:-translate-y-6 md:-translate-y-4">
            {/* College Logo - centered above Engenia image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20, filter: 'blur(6px)' }}
              animate={{ 
                opacity: showLogo ? 1 : 0, 
                scale: showLogo ? 1 : 0.8, 
                y: showLogo ? 0 : -20, 
                filter: showLogo ? 'blur(0px)' : 'blur(6px)' 
              }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
              className="mb-8 sm:mb-10 md:mb-12"
            >
              <div className="mx-auto w-fit">
                <img 
                  src="/logo5.png" 
                  alt="ENGENIA Logo" 
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain shadow-2xl hover:scale-110 transition-transform duration-300 mx-auto"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))'
                  }}
                />
              </div>
            </motion.div>

            {/* Engenia Image - 'E' aligned with beam centerline */}
         <motion.div
  initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(6px)', x: 27 }}
  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', x: 27 }}
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