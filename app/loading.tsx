import nextDynamic from 'next/dynamic'

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

export default function GlobalLoading() {
  return (
    <main
      className="min-h-screen w-full px-4 md:px-10 pt-28 pb-16 text-white relative overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams
          beamWidth={2}
          beamHeight={14}
          beamNumber={8}
          lightColor="#00bcd4"
          speed={1.2}
          noiseIntensity={1.4}
          scale={0.15}
          rotation={0}
        />
      </div>

      {/* Centered Spinner */}
      <div className="relative z-10 flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white/80 animate-spin"
            aria-hidden="true"
          />
          <div className="absolute inset-2 rounded-full border-4 border-white/10 animate-pulse" />
        </div>
      </div>

      <p className="relative z-10 text-center text-white/70 text-sm">
        Loading...
      </p>
    </main>
  )
}
