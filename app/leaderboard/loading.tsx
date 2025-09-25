import nextDynamic from 'next/dynamic'

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

export default function Loading() {
  return (
    <main className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 text-white overflow-hidden" style={{backgroundColor: 'transparent'}}>
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#00bcd4" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>
      
      {/* Enhanced Background */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/3 rounded-full animate-bounce"
            style={{
              width: `${10 + (i % 3) * 5}px`,
              height: `${10 + (i % 3) * 5}px`,
              left: `${5 + i * 15}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Enhanced Header with Loading Animation */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-1 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute inset-3 bg-white/20 rounded-full animate-bounce" />
            </div>
          </div>
          <div className="h-10 md:h-16 w-64 mx-auto rounded-lg bg-white/10 animate-pulse mb-4" />
          <div className="h-4 w-80 mx-auto rounded bg-white/8 animate-pulse" />
        </div>
        
        {/* Enhanced Podium Loading */}
        <div className="mb-16 flex items-end justify-center gap-6 md:gap-12">
          {/* 2nd Place */}
          <div className="w-24 md:w-32 h-40 rounded-t-xl bg-gradient-to-br from-gray-300/20 to-gray-400/20 animate-pulse relative overflow-hidden">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full animate-bounce" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/60">2nd</div>
          </div>
          
          {/* 1st Place */}
          <div className="w-28 md:w-40 h-56 rounded-t-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 animate-pulse relative overflow-hidden">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-white/80 font-bold">1st</div>
          </div>
          
          {/* 3rd Place */}
          <div className="w-20 md:w-28 h-32 rounded-t-xl bg-gradient-to-br from-amber-600/20 to-yellow-700/20 animate-pulse relative overflow-hidden">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/60">3rd</div>
          </div>
        </div>
        
        {/* Enhanced Department Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-1 bg-gradient-to-br from-white/10 to-white/5 animate-pulse hover:from-white/15 hover:to-white/10 transition-all duration-500">
              <div className="rounded-xl bg-white/5 backdrop-blur-sm p-6 h-64 relative overflow-hidden">
                {/* Department Rank */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-pulse" />
                
                {/* Department Name */}
                <div className="mt-12 h-6 w-24 bg-white/15 rounded animate-pulse" />
                
                {/* Points */}
                <div className="mt-4 h-8 w-16 bg-white/20 rounded animate-pulse" />
                
                {/* Stats */}
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white/50 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm animate-pulse">Loading leaderboard rankings...</p>
        </div>
      </div>
    </main>
  )
}
