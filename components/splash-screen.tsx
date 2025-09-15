'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LightRays from './light-rays';
import BlurText from './blur-text';
import ShinyText from './shiny-text';
import { NavigationPrompt } from './navigation-prompt';
import { TransitionOverlay } from './transition-overlay';

export const SplashScreen: React.FC = () => {
  const [showText, setShowText] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTextComplete = () => {
    const timer = setTimeout(() => {
      setShowNavigation(true);
    }, 1000);

    return () => clearTimeout(timer);
  };

  const handleNavigation = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      router.push('/home');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <LightRays />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
        {showText && (
          <div className="mb-8">
            <BlurText 
              text="ENGENIA"
              className="text-6xl md:text-8xl font-bold text-white mb-6"
              onAnimationComplete={handleTextComplete}
            />
            <ShinyText 
              text="The Grand Festival of Innovation"
              className="text-lg md:text-xl text-gray-300"
            />
          </div>
        )}

        {showNavigation && (
          <NavigationPrompt onNavigate={handleNavigation} />
        )}
      </div>

      {isTransitioning && <TransitionOverlay />}
    </div>
  );
};
