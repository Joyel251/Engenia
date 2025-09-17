"use client"
import BlurText from "@/components/blur-text"
import ShinyText from "@/components/shiny-text"
import BubbleMenu from "@/components/BubbleMenu"
import LocomotiveScrollProvider from "@/components/locomotive-scroll-provider"
import { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { MapPin, Users, Music, Mic, Palette, Film, BookOpen, Award, Zap, Heart } from "lucide-react"

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
    href: '#',
    ariaLabel: 'Leaderboard',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'photogallery',
    href: '#',
    ariaLabel: 'Photo Gallery',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'updates',
    href: '#',
    ariaLabel: 'Updates',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
]

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
      
      <div className="relative bg-black text-white">
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
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
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
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
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
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
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
            <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
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

        {/* Events Section */}
        <section className="min-h-screen py-20 bg-gradient-to-b from-black via-purple-950/20 to-black relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(prefersReducedMotion ? 0 : (isMobile ? 6 : 20))].map((_, i) => (
              <motion.div
                key={`events-${i}`}
                className={`absolute bg-white/4 ${isMobile ? '' : 'backdrop-blur-sm'} border border-white/10 rounded-lg`}
                style={{
                  width: `${6 + (i % 4) * (isMobile ? 2 : 3)}px`,
                  height: `${6 + (i % 4) * (isMobile ? 2 : 3)}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: prefersReducedMotion ? 0 : [-(isMobile ? 8 : 20), (isMobile ? 8 : 20), -(isMobile ? 8 : 20)],
                  opacity: [0, 0.6, 0],
                  rotate: prefersReducedMotion ? 0 : [0, 360],
                  scale: prefersReducedMotion ? 1 : [0.7, (isMobile ? 1.2 : 1.5), 0.7],
                }}
                transition={{
                  duration: (isMobile ? 6 : 8) + i * 0.15,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              initial={isMobile ? { y: 16 } : { opacity: 0, scale: 0.8 }}
              whileInView={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              transition={isMobile ? { type: 'spring', stiffness: 140, damping: 18, delay: 0.2 } : { duration: 1, delay: 0.2 }}
              viewport={{ once: false }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 font-mono">Featured Events</h2>
              <p className="text-xl text-white max-w-2xl mx-auto font-serif">
                On-stage and off-stage competitions showcasing diverse talents
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {[
                {
                  icon: Music,
                  title: "Dance Competition",
                  desc: "20-25 participants per team, 9 minutes total (7 mins performance + 2 mins preparation). Minimum 3 dance styles required.",
                  location: "Main Stage • On-Stage Event",
                  color: "purple"
                },
                {
                  icon: Film,
                  title: "Short Film",
                  desc: "6-8 minutes duration with theme \"Silver Years\". Subtitles required. Industrial standards recommended with 2K resolution.",
                  location: "Media Center • On-Stage Event",
                  color: "blue"
                },
                {
                  icon: Mic,
                  title: "Music Competition",
                  desc: "12-18 participants including band manager. 10 minutes performance + 2 minutes preparation. Fusion not allowed, lyrics must be pre-approved.",
                  location: "Concert Hall • On-Stage Event",
                  color: "pink"
                },
                {
                  icon: Palette,
                  title: "Theme Show",
                  desc: "18-25 participants per department. Theme: \"Promising Beacons\". 7 minutes performance + 2 minutes preparation time.",
                  location: "Main Stage • On-Stage Event",
                  color: "amber"
                }
              ].map((event, index) => (
                <motion.div
                  key={event.title}
                  className="group cursor-pointer"
                  initial={{ 
                    opacity: 0, 
                    x: index % 2 === 0 ? -100 : 100,
                    rotateX: 15
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    rotateX: 0
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.2 + index * 0.2,
                    type: "spring",
                    stiffness: 80
                  }}
                  viewport={{ once: false }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className={`bg-gradient-to-br from-${event.color}-500/20 to-${event.color}-600/20 p-10 rounded-3xl border border-${event.color}-400/30 hover:border-${event.color}-400/60 transition-all duration-500 backdrop-blur-sm`}>
                    <div className="flex items-center gap-4 mb-6">
                      <event.icon className={`w-10 h-10 text-${event.color}-400`} />
                      <h3 className={`text-3xl font-bold text-${event.color}-400 font-mono`}>{event.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed font-serif">
                      {event.desc}
                    </p>
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin className="w-5 h-5" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="min-h-screen flex items-center justify-center py-20 relative">
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(prefersReducedMotion ? 0 : (isMobile ? 8 : 25))].map((_, i) => (
              <motion.div
                key={`experience-${i}`}
                className="absolute w-1 h-1 bg-white/15 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: prefersReducedMotion ? 1 : [0, (isMobile ? 1.2 : 2), 0],
                  y: prefersReducedMotion ? 0 : [-(isMobile ? 8 : 20), (isMobile ? 8 : 20), -(isMobile ? 8 : 20)],
                }}
                transition={{
                  duration: (isMobile ? 3 : 4) + Math.random() * (isMobile ? 2 : 3),
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div 
              className="mb-12"
              initial={isMobile ? { y: 16 } : { opacity: 0, y: -30 }}
              whileInView={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              transition={isMobile ? { type: 'spring', stiffness: 140, damping: 18, delay: 0.2 } : { duration: 1, delay: 0.2 }}
              viewport={{ once: false }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 font-mono">
                Join EnGenia 2025
              </h2>
              <motion.p 
                className="text-xl text-white max-w-3xl mx-auto leading-relaxed font-serif"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: false }}
              >
                Be part of LICET's most celebrated cultural festival where talents shine and creativity knows no bounds
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: false }}
            >
              <motion.button 
                className="px-12 py-5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full hover:from-purple-600 hover:to-violet-700 transition-all duration-300 text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 font-mono"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 20px 50px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Register Now
              </motion.button>
              <motion.button 
                className="px-12 py-5 border-2 border-purple-400/50 text-purple-300 font-bold rounded-full hover:border-purple-400 hover:text-white transition-all duration-300 text-lg backdrop-blur-sm font-mono"
                whileHover={{ 
                  scale: 1.1,
                  borderColor: "rgba(147, 51, 234, 0.8)",
                  color: "#ffffff"
                }}
                whileTap={{ scale: 0.95 }}
              >
                View Schedule
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
      </div>
    </LocomotiveScrollProvider>
  )
}