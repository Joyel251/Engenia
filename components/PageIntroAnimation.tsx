"use client"

import { motion } from "motion/react"
import { ReactNode } from "react"

interface PageIntroAnimationProps {
  children: ReactNode
  className?: string
}

export default function PageIntroAnimation({ children, className = "" }: PageIntroAnimationProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 60,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom easing for smooth animation
        staggerChildren: 0.1
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Header animation component
export function AnimatedPageHeader({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 40,
        filter: "blur(10px)"
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        filter: "blur(0px)"
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Content animation component  
export function AnimatedPageContent({ children, delay = 0.3 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 30,
        scale: 0.98
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  )
}