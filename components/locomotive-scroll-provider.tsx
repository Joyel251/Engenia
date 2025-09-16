"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import LocomotiveScroll from "locomotive-scroll"

interface LocomotiveScrollProviderProps {
  children: React.ReactNode
}

export default function LocomotiveScrollProvider({ children }: LocomotiveScrollProviderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (!scrollRef.current) return

    // Detect touch devices (real mobile/tablet) and fall back to native scrolling.
    // Many mobile browsers (especially iOS Safari) conflict with smooth scroll libs.
    const isTouchDevice = typeof window !== "undefined" && (
      "ontouchstart" in window ||
      (navigator as any).msMaxTouchPoints > 0 ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia?.("(pointer: coarse)").matches
    )
    setIsTouch(isTouchDevice)

    // Save previous body/html styles to restore on cleanup
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyHeight = document.body.style.height

    const initLocomotiveScroll = async () => {
      // If we're on a touch device, skip initializing Locomotive to avoid scroll lock.
      if (isTouchDevice) {
        // Ensure native scrolling is enabled on real devices
        document.documentElement.style.overflow = "auto"
        document.body.style.overflow = "auto"
        document.body.style.height = "auto"
        ;(document.body.style as any).WebkitOverflowScrolling = "touch"
        return
      }

      locomotiveScrollRef.current = new (LocomotiveScroll as any)({
        el: scrollRef.current!,
        smooth: true,
        multiplier: 1,
        class: "is-revealed",
        scrollbarContainer: false,
        lenisOptions: {
          lerp: 0.1,
          duration: 1.2,
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        },
      } as any)
    }

    initLocomotiveScroll()

    return () => {
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy()
      }
      // Restore previous scroll-related styles
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.height = prevBodyHeight
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      {...(!isTouch ? { "data-scroll-container": true } : {})}
      style={{
        // On touch devices, let the window own scrolling; on desktop, container can scroll
        minHeight: "100vh",
        width: "100%",
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch" as any,
        overflowY: isTouch ? "visible" : "auto",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  )
}
