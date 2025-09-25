"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function LaunchGate() {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [unlaunched, setUnlaunched] = useState(false)

  useEffect(() => {
    let aborted = false
    async function check() {
      try {
        // Only check the splash screen ('/')
        if (pathname === '/') {
          const res = await fetch('/api/launchstatus', { cache: 'no-store' })
          if (!aborted && res.ok) {
            const data = (await res.json()) as { launched?: boolean }
            setUnlaunched(!data?.launched)
          }
        } else {
          setUnlaunched(false)
        }
      } catch {
        // On failure, do nothing (assume unblocked)
        setUnlaunched(false)
      } finally {
        if (!aborted) setChecked(true)
      }
    }
    check()
    return () => {
      aborted = true
    }
  }, [pathname, router])

  // If not on splash or not checked, render nothing
  if (!checked) return null
  if (pathname !== '/') return null

  // If not launched, show an overlay message instead of redirect
  if (unlaunched) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Website not launched yet</h2>
          <p className="text-white/70">Please check back later.</p>
        </div>
      </div>
    )
  }

  return null
}
