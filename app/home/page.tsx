"use client";

import BubbleMenu from "../../components/BubbleMenu";
import LightRays from "../../components/light-rays";

const menuItems = [
  {
    label: 'home',
    href: '#',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'events',
    href: '#',
    ariaLabel: 'Events',
    rotation: 8,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'schedule',
    href: '#',
    ariaLabel: 'Schedule',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'register',
    href: '#',
    ariaLabel: 'Register',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'contact',
    href: '#',
    ariaLabel: 'Contact',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Light rays background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={1.0}
          lightSpread={1.5}
          rayLength={2.0}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0}
          distortion={0.03}
          pulsating={false}
          fadeDistance={0.8}
          saturation={1.0}
          className="w-full h-full"
        />
      </div>

      {/* BubbleMenu Navigation */}
      <BubbleMenu
        logo={
          <span className="font-bold text-lg text-black">
            ENGENIA
          </span>
        }
        items={menuItems}
        menuAriaLabel="Toggle navigation"
        menuBg="rgba(255, 255, 255, 0.95)"
        menuContentColor="#111111"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.6}
        staggerDelay={0.1}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
            ENGENIA 2K25
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            The Grand Festival of Innovation, Creativity, and Excellence
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-white font-semibold mb-2">Innovation</h3>
              <p className="text-white/70 text-sm">Cutting-edge technology and breakthrough ideas</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-white font-semibold mb-2">Creativity</h3>
              <p className="text-white/70 text-sm">Artistic expression and creative excellence</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-white font-semibold mb-2">Excellence</h3>
              <p className="text-white/70 text-sm">Celebrating outstanding achievements</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Join the Festival
            </button>
            
            <p className="text-white/60 text-sm">
              Experience the future of innovation and creativity
            </p>
          </div>
        </div>
      </div>

     
    </div>
  );
}