import nextDynamic from 'next/dynamic'

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

export default function LoadingEvents() {
  // Enhanced shimmering skeleton layout with better design
  const skeletons = Array.from({ length: 4 })
  return (
    <main className="min-h-screen w-full px-4 md:px-10 pt-28 pb-16 text-white animate-fade-in relative overflow-hidden" style={{backgroundColor: 'transparent'}} aria-busy="true" aria-live="polite">
      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={14} beamNumber={8} lightColor="#00bcd4" speed={1.2} noiseIntensity={1.4} scale={0.15} rotation={0} />
      </div>
      
      {/* Additional Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/3 rounded-full animate-bounce"
            style={{
              width: `${8 + (i % 3) * 6}px`,
              height: `${8 + (i % 3) * 6}px`,
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + (i % 2)}s`,
            }}
          />
        ))}
      </div>
      {/* Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 tracking-tight animate-pulse">
            Events
          </h1>
          <p className="text-white/80 text-lg animate-pulse">Loading exciting events...</p>
        </div>
        
        {/* Enhanced Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {skeletons.map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 md:p-6 overflow-hidden hover:bg-white/10 transition-all duration-500">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 rounded-full bg-white/20 shimmer" />
                <div className="h-4 w-24 bg-white/15 rounded shimmer" />
              </div>
              
              {/* Image Skeleton */}
              <div className="mb-4 h-48 sm:h-60 w-full rounded-[15px] bg-white/10 shimmer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-3 w-16 bg-white/20 rounded shimmer" />
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-white/15 rounded shimmer" />
                <div className="h-4 w-1/2 bg-white/10 rounded shimmer" />
                
                {/* Points Skeleton */}
                <div className="flex gap-2 mt-2">
                  <div className="h-6 w-10 rounded bg-white/15 shimmer" />
                  <div className="h-6 w-10 rounded bg-white/15 shimmer" />
                  <div className="h-6 w-10 rounded bg-white/15 shimmer" />
                </div>
                
                {/* Button Skeleton */}
                <div className="mt-4 h-9 w-full rounded-lg bg-white/10 shimmer" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Progress Indicator */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white/40 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm animate-pulse">Preparing events for you...</p>
        </div>
      </div>
      <style>{`
        .shimmer { 
          position: relative; 
          overflow: hidden; 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer-wave 2s infinite linear;
        }
        .shimmer::after { 
          content: ''; 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.15) 45%, transparent 90%); 
          animation: shimmer-sweep 2.5s linear infinite; 
        }
        @keyframes shimmer-sweep { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(100%); } 
        }
        @keyframes shimmer-wave {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { 
          animation: fade-in 0.8s ease-out; 
        }
      `}</style>
    </main>
  )
}
