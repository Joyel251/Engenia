"use client"
import BlurText from "@/components/blur-text"
import ShinyText from "@/components/shiny-text"
import BubbleMenu from "@/components/BubbleMenu"
import LocomotiveScrollProvider from "@/components/locomotive-scroll-provider"
import nextDynamic from 'next/dynamic'
import { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Users } from "lucide-react"
import Image from "next/image"

const menuItems = [
  {
    label: 'home',
    href: '/',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'events',
    href: '/events',
    ariaLabel: 'Events',
    rotation: 8,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'leaderboard',
    href: '/leaderboard',
    ariaLabel: 'Leaderboard',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'photogallery',
    href: '/photogallery',
    ariaLabel: 'Photo Gallery',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'updates',
    href: '/announcements',
    ariaLabel: 'Updates & Announcements',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
]

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

export default function LandingPage() {
  const [showShinyText, setShowShinyText] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const heroRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAnimationComplete = () => {
    setShowShinyText(true)
  }

  useEffect(() => {
    // Detect mobile/coarse pointer once on mount
    const coarse = typeof window !== 'undefined' && (matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)
    setIsMobile(!!coarse)

    // Use rAF to track hero position; works with native and Locomotive scrolling
    const threshold = 150
    let raf = 0
    let last = showScrollHint
    const tick = () => {
      const top = heroRef.current?.getBoundingClientRect().top ?? 0
      const y = Math.max(0, -top)
      const next = y < threshold
      if (next !== last) {
        last = next
        setShowScrollHint(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <LocomotiveScrollProvider>
      {/* Fullscreen beams background (GPU-accelerated, fixed, non-interactive) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#ffffff" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>

      {/* BubbleMenu Navigation */}
      <BubbleMenu
        logo="/logo.jpg"
        items={menuItems}
        menuAriaLabel="Toggle navigation"
        menuBg="rgba(255, 255, 255, 0.95)"
        menuContentColor="#111111"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.6}
        staggerDelay={0.1} 
      />
      
      <div className="relative text-white">
        {/* Foreground content wrapper to ensure above background */}
        <div className="relative z-10">
  {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen w-full overflow-hidden">
          <div className="absolute inset-0 z-5 pointer-events-none">
            {[...Array(prefersReducedMotion ? 0 : (isMobile ? 5 : 12))].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute bg-white/8 ${isMobile ? '' : 'backdrop-blur-sm'} border border-white/15 rounded-lg`}
                style={{
                  width: `${12 + (i % 4) * (isMobile ? 4 : 8)}px`,
                  height: `${12 + (i % 4) * (isMobile ? 4 : 8)}px`,
                  left: `${5 + i * 8}%`,
                  top: `${10 + (i % 5) * 18}%`,
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: prefersReducedMotion ? 1 : [0.7, (isMobile ? 1.1 : 1.4), 0.7],
                  rotate: prefersReducedMotion ? 0 : [0, 180, 360],
                  x: prefersReducedMotion ? 0 : [0, i % 2 === 0 ? (isMobile ? 15 : 50) : (isMobile ? -15 : -50), 0],
                  y: prefersReducedMotion ? 0 : [0, i % 3 === 0 ? (isMobile ? -12 : -30) : (isMobile ? 12 : 30), 0],
                }}
                transition={{
                  duration: (isMobile ? 4 : 5) + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <div className="text-center px-4">
              {!showShinyText ? (
                <BlurText
                  text="ENGENIA 2025"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-[0.15em] drop-shadow-2xl leading-[0.85] select-none font-mono"
                />
              ) : (
                <ShinyText
                  text="ENGENIA 2025"
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-[0.15em] drop-shadow-2xl leading-[0.85] select-none font-mono"
                />
              )}
            </div>

            {showShinyText && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-12 text-center"
              >
                <p className="text-xl sm:text-2xl md:text-3xl text-white font-light tracking-wide font-serif">
                  LICET Annual Cultural Festival
                </p>
                <p className="text-lg sm:text-xl text-white/80 mt-4 font-serif">
                  September 29-30, 2025 • 
                </p>
              </motion.div>
            )}
          </div>

          {/* Scroll hint (blinks; hides after scroll, shows near top) */}
          {showScrollHint && (
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 text-white/70 text-sm tracking-widest uppercase pointer-events-none animate-pulse select-none"
              style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${isMobile ? 96 : 24}px)` }}
            >
              Scroll to explore
            </div>
          )}
        </section>


      
{/* About Section */}
<section className="min-h-screen flex items-center justify-center py-20 relative">
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(prefersReducedMotion ? 0 : (isMobile ? 3 : 8))].map((_, i) => (
      <motion.div
        key={`about-${i}`}
        className={`absolute bg-white/6 ${isMobile ? '' : 'backdrop-blur-sm'} border border-purple-400/20 rounded-xl`}
        style={{
          width: `${16 + (i % 3) * (isMobile ? 8 : 12)}px`,
          height: `${16 + (i % 3) * (isMobile ? 8 : 12)}px`,
          right: `${8 + i * 12}%`,
          top: `${15 + (i % 4) * 20}%`,
        }}
        animate={{
          opacity: [0, 0.5, 0],
          x: prefersReducedMotion ? 0 : [-(isMobile ? 10 : 30), (isMobile ? 10 : 30), -(isMobile ? 10 : 30)],
          rotate: prefersReducedMotion ? 0 : [0, 120, 240],
          scale: prefersReducedMotion ? 1 : [0.9, (isMobile ? 1.15 : 1.3), 0.9],
        }}
        transition={{
          duration: (isMobile ? 6 : 7) + i * 0.3,
          repeat: Infinity,
          delay: i * 1.1,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>

  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div 
        className="mb-12"
        initial={isMobile ? { y: 16 } : { opacity: 0, x: -100 }}
        whileInView={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
        transition={isMobile ? { type: 'spring', stiffness: 140, damping: 18, delay: 0.2 } : { duration: 1, delay: 0.2 }}
        viewport={{ once: false }}
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-mono">About EnGenia</h2>
      </motion.div>

      <motion.p
        className="text-lg sm:text-xl text-gray-300 mb-16 leading-relaxed max-w-3xl mx-auto font-serif"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: false }}
      >
        EnGenia is one of the facets of vibrant campus life at LICET. It is a two day annual cultural fest for
        students to reinvent their talents, showcase their creative and innovative skills. EnGenia fosters
        self-belief, perseverance, hard work and most of all, teamwork among the participants and encourages a
        healthy competition between the departments.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <motion.div
          className="p-6 bg-gradient-to-br from-purple-500/10 to-violet-600/10 backdrop-blur-sm rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500"
          initial={isMobile ? { y: 16 } : { x: -200, rotateY: -45, opacity: 0 }}
          whileInView={isMobile ? { y: 0 } : { x: 0, rotateY: 0, opacity: 1 }}
          transition={isMobile ? { type: "spring", stiffness: 140, damping: 18, delay: 0.1 } : { 
            duration: 0.8, 
            delay: 0.1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          viewport={{ once: false }}
          whileHover={!isMobile ? { 
            rotateY: 10, 
            rotateX: 5,
            scale: 1.05,
            transition: { duration: 0.3 }
          } : {}}
        >
          <motion.div
            initial={isMobile ? { x: -12 } : { scale: 0.8 }}
            whileInView={isMobile ? { x: 0 } : { scale: 1 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.15 } : {
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 120
            }}
          >
            <h3 className="text-xl font-bold mb-3 text-white font-mono">Academic Excellence</h3>
          </motion.div>
          <motion.p
            className="text-gray-400 text-sm font-serif"
            initial={isMobile ? { x: 12 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { x: 0 } : { opacity: 1, y: 0 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.22 } : {
              delay: 0.5,
              duration: 0.4
            }}
          >
            Preparing students with value-added courses and skill-based training
          </motion.p>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 backdrop-blur-sm rounded-2xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-500"
          initial={isMobile ? { y: 16 } : { x: 200, rotateY: 45, opacity: 0 }}
          whileInView={isMobile ? { y: 0 } : { x: 0, rotateY: 0, opacity: 1 }}
          transition={isMobile ? { type: "spring", stiffness: 140, damping: 18, delay: 0.3 } : { 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          viewport={{ once: false }}
          whileHover={!isMobile ? { 
            rotateY: -10, 
            rotateX: 5,
            scale: 1.05,
            transition: { duration: 0.3 }
          } : {}}
        >
          <motion.div
            initial={isMobile ? { x: -12 } : { scale: 0.8 }}
            whileInView={isMobile ? { x: 0 } : { scale: 1 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.35 } : {
              delay: 0.5,
              duration: 0.5,
              type: "spring",
              stiffness: 120
            }}
          >
            <h3 className="text-xl font-bold mb-3 text-white font-mono">Professionalism</h3>
          </motion.div>
          <motion.p
            className="text-gray-400 text-sm font-serif"
            initial={isMobile ? { x: 12 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { x: 0 } : { opacity: 1, y: 0 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.42 } : {
              delay: 0.7,
              duration: 0.4
            }}
          >
            Excelling through interaction and integration with industries
          </motion.p>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-600/10 backdrop-blur-sm rounded-2xl border border-pink-400/20 hover:border-pink-400/40 transition-all duration-500"
          initial={isMobile ? { y: 16 } : { x: -200, rotateY: -45, opacity: 0 }}
          whileInView={isMobile ? { y: 0 } : { x: 0, rotateY: 0, opacity: 1 }}
          transition={isMobile ? { type: "spring", stiffness: 140, damping: 18, delay: 0.5 } : { 
            duration: 0.8, 
            delay: 0.5,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          viewport={{ once: false }}
          whileHover={!isMobile ? { 
            rotateY: 10, 
            rotateX: -5,
            scale: 1.05,
            transition: { duration: 0.3 }
          } : {}}
        >
          <motion.div
            initial={isMobile ? { x: -12 } : { scale: 0.8 }}
            whileInView={isMobile ? { x: 0 } : { scale: 1 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.55 } : {
              delay: 0.7,
              duration: 0.5,
              type: "spring",
              stiffness: 120
            }}
          >
            <h3 className="text-xl font-bold mb-3 text-white font-mono">Holistic Formation</h3>
          </motion.div>
          <motion.p
            className="text-gray-400 text-sm font-serif"
            initial={isMobile ? { x: 12 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { x: 0 } : { opacity: 1, y: 0 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.62 } : {
              delay: 0.9,
              duration: 0.4
            }}
          >
            Overall growth through sports and cultural activities
          </motion.p>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm rounded-2xl border border-amber-400/20 hover:border-amber-400/40 transition-all duration-500"
          initial={isMobile ? { y: 16 } : { x: 200, rotateY: 45, opacity: 0 }}
          whileInView={isMobile ? { y: 0 } : { x: 0, rotateY: 0, opacity: 1 }}
          transition={isMobile ? { type: "spring", stiffness: 140, damping: 18, delay: 0.7 } : { 
            duration: 0.8, 
            delay: 0.7,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          viewport={{ once: false }}
          whileHover={!isMobile ? { 
            rotateY: -10, 
            rotateX: -5,
            scale: 1.05,
            transition: { duration: 0.3 }
          } : {}}
        >
          <motion.div
            initial={isMobile ? { x: -12 } : { scale: 0.8 }}
            whileInView={isMobile ? { x: 0 } : { scale: 1 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.75 } : {
              delay: 0.9,
              duration: 0.5,
              type: "spring",
              stiffness: 120
            }}
          >
            <h3 className="text-xl font-bold mb-3 text-white font-mono">International Exposure</h3>
          </motion.div>
          <motion.p
            className="text-gray-400 text-sm font-serif"
            initial={isMobile ? { x: 12 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? { x: 0 } : { opacity: 1, y: 0 }}
            transition={isMobile ? { type: "spring", stiffness: 160, damping: 18, delay: 0.82 } : {
              delay: 1.1,
              duration: 0.4
            }}
          >
            World-class exposure through university collaborations
          </motion.p>
        </motion.div>
      </div>
    </div>
  </div>
</section>

        {/* Departments Section */}
        <section className="min-h-screen py-20 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(prefersReducedMotion ? 0 : (isMobile ? 5 : 15))].map((_, i) => (
              <motion.div
                key={`dept-${i}`}
                className={`absolute bg-white/4 ${isMobile ? '' : 'backdrop-blur-sm'} border border-white/10 rounded-lg`}
                style={{
                  width: `${8 + (i % 5) * (isMobile ? 2 : 4)}px`,
                  height: `${8 + (i % 5) * (isMobile ? 2 : 4)}px`,
                  left: `${-5 + i * 7}%`,
                  top: `${2 + (i % 6) * 15}%`,
                }}
                animate={{
                  x: prefersReducedMotion ? 0 : [0, (isMobile ? 60 : 150), (isMobile ? 120 : 300)],
                  opacity: [0, 0.8, 0],
                  rotate: prefersReducedMotion ? 0 : [0, 180, 360],
                  scale: prefersReducedMotion ? 1 : [0.6, (isMobile ? 1.05 : 1.2), 0.6],
                }}
                transition={{
                  duration: (isMobile ? 8 : 10) + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              initial={isMobile ? { y: 16 } : { opacity: 0, y: -50 }}
              whileInView={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              transition={isMobile ? { type: 'spring', stiffness: 140, damping: 18, delay: 0.2 } : { duration: 1, delay: 0.2 }}
              viewport={{ once: false }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 font-mono">
                Participating Departments
              </h2>
              <p className="text-xl text-white max-w-2xl mx-auto font-serif">
                Seven departments competing for cultural supremacy
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { name: "CSE-A", desc: "Computer Science & Engineering - Section A", color: "purple" },
                { name: "CSE-B", desc: "Computer Science & Engineering - Section B", color: "blue" },
                { name: "AI/DS", desc: "Artificial Intelligence & Data Science", color: "green" },
                { name: "ECE", desc: "Electronics & Communication Engineering", color: "pink" },
                { name: "MECH", desc: "Mechanical Engineering", color: "amber" },
                { name: "EEE", desc: "Electrical & Electronics Engineering", color: "emerald" },
                { name: "IT", desc: "Information Technology", color: "indigo" }
              ].map((dept, index) => (
                <motion.div
                  key={dept.name}
                  className="group cursor-pointer"
                  initial={{ 
                    opacity: 0, 
                    x: index % 2 === 0 ? -100 : 100,
                    rotateY: index % 2 === 0 ? -15 : 15
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    rotateY: 0
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: false }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className={`bg-gradient-to-br from-${dept.color}-500/20 to-${dept.color}-600/20 p-8 rounded-3xl border border-${dept.color}-400/30 hover:border-${dept.color}-400/60 transition-all duration-500 backdrop-blur-sm`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-2xl font-bold text-${dept.color}-400 font-mono`}>{dept.name}</h3>
                    </div>
                    <p className="text-gray-300 mb-4 font-serif">{dept.desc}</p>
                    <div className="flex items-center gap-3 text-gray-400">
                      <Users className="w-5 h-5" />
                      <span>Department Team</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

       {/* Cultural Gallery Section (replaces Featured Events & Join Now) */}
        <section className="min-h-screen py-20 relative bg-gradient-to-b from-black via-zinc-900/30 to-black">
          {/* Ambient particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(prefersReducedMotion ? 0 : (isMobile ? 4 : 12))].map((_, i) => (
              <motion.div
                key={`gallery-ambient-${i}`}
                className="absolute bg-white/5 rounded-full"
                style={{
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  left: `${(i * 97) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: prefersReducedMotion ? 0 : [0, (i % 2 ? 20 : -20), 0],
                }}
                transition={{ duration: 6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={isMobile ? { y: 16 } : { opacity: 0, y: 20 }}
              whileInView={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 font-mono">Cultural Highlights</h2>
              <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto font-serif">A glimpse of LICET's vibrant cultural spirit</p>
            </motion.div>

            {/* Mobile: Vertical scroll gallery with animations */}
            <div className="md:hidden space-y-8">
              {[
                { src: '/1.webp', title: 'Valedictory Ceremony  ENGENIA-2024', desc: 'The Valedictory Ceremony of ENGENIA 2024 at Loyola-ICAM College of Engineering and Technology (LICET), graced by Chief Guest T. J. Gnanavel, renowned film director and screenwriter.' },
                { src: '/2.webp', title: 'Cultural Dance Extravaganza', desc: 'A captivating group performance blending artistry and innovation, where rhythm and synchronized movements created a visual spectacle on stage.' },
                { src: '/3.webp', title: 'Live Musical Performance', desc: 'Electrifying band performance filling the atmosphere with energy, passion, and rhythm.' },
                { src: '/4.webp', title: 'Channel Surfing Event', desc: 'Channel Surfing brought vibrant energy to the stage, reflecting the spirit of fun and imagination.' },
                { src: '/6.webp', title: 'Special Walk-in Guest Appearance – Arivu', desc: 'A surprise appearance by Arivu brought excitement and joy to the cultural celebrations.' },
                { src: '/5.webp', title: 'Celebrating the Champions', desc: 'The winners of the cultural extravaganza proudly celebrating their achievements on the grand stage.' }
                
              ].map((item, idx) => (
                <motion.div
                  key={item.src}
                  className="group"
                  initial={{ 
                    opacity: 0, 
                    y: 80,
                    scale: 0.9,
                    rotateX: 15
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    // Merge subtle scale pop previously in whileInView2
                    scale: [1, 1.02, 1],
                    rotateX: 0
                  }}
                  viewport={{ 
                    once: false, 
                    amount: 0.2,
                    margin: "-50px 0px -50px 0px"
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: idx * 0.15,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-zinc-900/60 backdrop-blur-sm shadow-2xl">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority={idx < 2}
                        className="object-cover transition-all duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Animated overlay elements */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                        initial={{ x: '-100%' }}
                        whileInView={{ x: '100%' }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 0.3 + idx * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <motion.div
                          initial={{ y: 30, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{ delay: 0.4 + idx * 0.15, duration: 0.6 }}
                        >
                          <motion.h3 
                            className="text-white font-bold text-xl mb-2 font-mono"
                            initial={{ x: -20 }}
                            whileInView={{ x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.15, duration: 0.5 }}
                          >
                            {item.title}
                          </motion.h3>
                          <motion.p 
                            className="text-white/70 text-sm font-serif mb-4"
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + idx * 0.15, duration: 0.5 }}
                          >
                            {item.desc}
                          </motion.p>
                          <motion.div 
                            className="h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: '60px' }}
                            transition={{ delay: 0.7 + idx * 0.15, duration: 0.8 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tablet: Vertical scroll grid with animations */}
            <div className="hidden md:grid lg:hidden grid-cols-1 gap-10 max-w-2xl mx-auto">
              {[
                { src: '/1.webp', title: 'Valedictory Ceremony  ENGENIA-2024', desc: 'The Valedictory Ceremony of ENGENIA 2024 at Loyola-ICAM College of Engineering and Technology (LICET), graced by Chief Guest T. J. Gnanavel, renowned film director and screenwriter.', featured: true },
                { src: '/2.webp', title: 'Cultural Dance Extravaganza', desc: 'A captivating group performance blending artistry and innovation, where rhythm and synchronized movements created a visual spectacle on stage.', featured: false },
                { src: '/3.webp', title: 'Live Musical Performance', desc: 'Electrifying band performance filling the atmosphere with energy, passion, and rhythm.', featured: false },
                { src: '/4.webp', title: 'Channel Surfing Event', desc: 'Channel Surfing brought vibrant energy to the stage, reflecting the spirit of fun and imagination.', featured: false },
                { src: '/6.webp', title: 'Special Walk-in Guest Appearance – Arivu', desc: 'A surprise appearance by Arivu brought excitement and joy to the cultural celebrations.', featured: false },
                { src: '/5.webp', title: 'Celebrating the Champions', desc: 'The winners of the cultural extravaganza proudly celebrating their achievements on the grand stage.', featured: false }
              ].map((item, idx) => (
                <motion.div
                  key={item.src}
                  className="group cursor-pointer"
                  initial={{ 
                    opacity: 0, 
                    y: 100,
                    rotateX: 20,
                    scale: 0.95 
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    rotateX: 0,
                    scale: 1 
                  }}
                  viewport={{ 
                    once: false, 
                    amount: 0.2,
                    margin: "-80px 0px -80px 0px"
                  }}
                  transition={{ 
                    duration: 0.9, 
                    delay: idx * 0.2,
                    type: "spring",
                    stiffness: 60,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    rotateY: idx % 2 === 0 ? 2 : -2,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-zinc-900/60 backdrop-blur-sm shadow-2xl">
                    <div className={`relative ${item.featured ? 'aspect-[21/10]' : 'aspect-[16/9]'}`}>
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(min-width: 768px) and (max-width: 1024px) 600px, 400px"
                        priority={idx < 2}
                        className="object-cover transition-all duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      
                      {/* Animated shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12"
                        initial={{ x: '-120%' }}
                        whileInView={{ x: '120%' }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ 
                          duration: 1.5, 
                          delay: 0.4 + idx * 0.25,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                      
                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.div
                          initial={{ y: 40, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{ delay: 0.5 + idx * 0.2, duration: 0.8 }}
                        >
                          <motion.h3 
                            className={`text-white font-bold mb-3 font-mono ${item.featured ? 'text-3xl' : 'text-2xl'}`}
                            initial={{ x: -30 }}
                            whileInView={{ x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.2, duration: 0.6 }}
                          >
                            {item.title}
                          </motion.h3>
                          <motion.p 
                            className={`text-white/80 font-serif mb-4 ${item.featured ? 'text-lg' : 'text-base'}`}
                            initial={{ x: -30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 + idx * 0.2, duration: 0.6 }}
                          >
                            {item.desc}
                          </motion.p>
                          <motion.div 
                            className={`h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full ${item.featured ? 'w-24' : 'w-16'}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: item.featured ? '96px' : '64px' }}
                            transition={{ delay: 0.8 + idx * 0.2, duration: 1 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: Vertical scroll layout with advanced animations */}
            <div className="hidden lg:block max-w-6xl mx-auto space-y-16">
              {[
                { 
                  src: '/1.webp', 
                  title: 'Valedictory Ceremony – ENGENIA 2024',
                  desc: 'The Valedictory Ceremony of ENGENIA 2024 at Loyola-ICAM College of Engineering and Technology (LICET), graced by Chief Guest T. J. Gnanavel, renowned film director and screenwriter.',
                  layout: 'hero'
                },
                { 
                  src: '/2.webp', 
                  title: 'Cultural Dance Extravaganza',
                  desc: 'A captivating group performance blending artistry and innovation, where rhythm and synchronized movements created a visual spectacle on stage',
                  layout: 'left'
                },
                { 
                  src: '/3.webp', 
                  title: 'Live Musical Performance', 
                  desc: 'Electrifying band performance filling the atmosphere with energy, passion, and rhythm.',
                  layout: 'right'
                },
                { 
                  src: '/4.webp', 
                  title: 'Channel Surfing Event',
                  desc: 'Channel Surfing brought vibrant energy to the stage, reflecting the spirit of fun and imagination.',
                  layout: 'left'
                },
                {
                  src: '/6.webp',
                  title: 'Special Walk-in Guest Appearance – Arivu',
                  desc: 'A surprise appearance by Arivu brought excitement and joy to the cultural celebrations.',
                  layout: 'right'
                },
                { 
                  src: '/5.webp', 
                  title: 'Celebrating the Champions',
                  desc: 'The winners of the cultural extravaganza proudly celebrating their achievements on the grand stage.',
                  layout: 'center'
                }
                
              ].map((item, idx) => {
                // Hero layout for first image
                if (item.layout === 'hero') {
                  return (
                    <motion.div
                      key={item.src}
                      className="group cursor-pointer"
                      initial={{ 
                        opacity: 0, 
                        y: 120,
                        scale: 0.9,
                        rotateX: 15
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                        rotateX: 0
                      }}
                      viewport={{ 
                        once: false, 
                        amount: 0.2,
                        margin: "-100px 0px -100px 0px"
                      }}
                      transition={{ 
                        duration: 1.2, 
                        type: "spring",
                        stiffness: 50,
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        rotateX: -2,
                        transition: { duration: 0.4 }
                      }}
                    >
                      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-zinc-900/70 backdrop-blur-sm shadow-2xl">
                        <div className="relative aspect-[21/9]">
                          <Image
                            src={item.src}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 1200px, 100vw"
                            priority
                            className="object-cover transition-all duration-1500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          {/* Animated particles */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white/40 rounded-full"
                                style={{
                                  left: `${20 + i * 10}%`,
                                  top: `${30 + (i % 3) * 20}%`,
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                  y: [0, -20, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                            initial={{ x: '-150%' }}
                            whileInView={{ x: '150%' }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ 
                              duration: 2, 
                              delay: 0.5,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                          />
                          
                          {/* Content overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-12">
                            <motion.div
                              initial={{ y: 60, opacity: 0 }}
                              whileInView={{ y: 0, opacity: 1 }}
                              viewport={{ once: false, amount: 0.3 }}
                              transition={{ delay: 0.7, duration: 1 }}
                            >
                              <motion.h3 
                                className="text-white font-bold text-5xl mb-4 font-mono"
                                initial={{ x: -50 }}
                                whileInView={{ x: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                              >
                                {item.title}
                              </motion.h3>
                              <motion.p 
                                className="text-white/90 text-xl font-serif mb-6 max-w-3xl"
                                initial={{ x: -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                              >
                                {item.desc}
                              </motion.p>
                              <motion.div 
                                className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: '120px' }}
                                transition={{ delay: 1.2, duration: 1.2 }}
                              />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                }
                
                // Split layout for other images
                const isLeft = item.layout === 'left'
                const isCenter = item.layout === 'center'
                
                return (
                  <motion.div
                    key={item.src}
                    className={`grid grid-cols-12 gap-12 items-center ${isCenter ? 'justify-center' : ''}`}
                    initial={{ 
                      opacity: 0, 
                      x: isCenter ? 0 : (isLeft ? -100 : 100),
                      y: isCenter ? 80 : 0,
                      rotateY: isCenter ? 0 : (isLeft ? -10 : 10)
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0,
                      y: 0,
                      rotateY: 0
                    }}
                    viewport={{ 
                      once: false, 
                      amount: 0.2,
                      margin: "-100px 0px -100px 0px"
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: idx * 0.3,
                      type: "spring",
                      stiffness: 60,
                      damping: 15
                    }}
                  >
                    {/* Content */}
                    <motion.div 
                      className={`${isCenter ? 'col-span-12 text-center' : 'col-span-5'} ${isLeft ? 'order-1' : isCenter ? 'order-1' : 'order-2'}`}
                      initial={{ 
                        opacity: 0, 
                        x: isCenter ? 0 : (isLeft ? -60 : 60)
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        x: 0
                      }}
                      transition={{ 
                        delay: 0.4 + idx * 0.3, 
                        duration: 0.8 
                      }}
                    >
                      <motion.h3 
                        className="text-white font-bold text-4xl mb-6 font-mono"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + idx * 0.3, duration: 0.6 }}
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p 
                        className="text-white/80 text-lg font-serif mb-8 leading-relaxed"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + idx * 0.3, duration: 0.6 }}
                      >
                        {item.desc}
                      </motion.p>
                      <motion.div 
                        className={`h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full ${isCenter ? 'w-24 mx-auto' : 'w-20'}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: isCenter ? '96px' : '80px' }}
                        transition={{ delay: 0.8 + idx * 0.3, duration: 1 }}
                      />
                    </motion.div>
                    
                    {/* Image */}
                    <motion.div 
                      className={`${isCenter ? 'col-span-8 col-start-3 mt-8' : 'col-span-7'} ${isLeft ? 'order-2' : isCenter ? 'order-2' : 'order-1'} group cursor-pointer`}
                      initial={{ 
                        opacity: 0, 
                        scale: 0.9,
                        rotateY: isCenter ? 0 : (isLeft ? 15 : -15)
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        scale: 1,
                        rotateY: 0
                      }}
                      transition={{ 
                        delay: 0.5 + idx * 0.3, 
                        duration: 1,
                        type: "spring",
                        stiffness: 80,
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.03,
                        rotateY: isLeft ? 5 : (isCenter ? 0 : -5),
                        transition: { duration: 0.4 }
                      }}
                    >
                      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-zinc-900/60 backdrop-blur-sm shadow-xl">
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={item.src}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 700px, 100vw"
                            className="object-cover transition-all duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Animated overlay effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12"
                            initial={{ x: '-120%' }}
                            whileInView={{ x: '120%' }}
                            viewport={{ once: false, amount: 0.4 }}
                            transition={{ 
                              duration: 1.5, 
                              delay: 0.8 + idx * 0.3,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                          />
                          
                          {/* Floating elements */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white/50 rounded-full"
                                style={{
                                  left: `${25 + i * 15}%`,
                                  top: `${20 + (i % 2) * 40}%`,
                                }}
                                animate={{
                                  opacity: [0, 0.8, 0],
                                  y: [0, -15, 0],
                                  scale: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  delay: i * 0.5 + idx * 0.2,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
      </div>
    </LocomotiveScrollProvider>
  )
}