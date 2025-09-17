export default function LoadingEvents() {
  // Simple shimmering skeleton layout
  const skeletons = Array.from({ length: 6 })
  return (
    <main className="min-h-screen w-full px-4 md:px-10 pt-28 pb-16 bg-black text-white animate-fade-in" aria-busy="true" aria-live="polite">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-10 tracking-tight">
          Events
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {skeletons.map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-20 rounded-full bg-zinc-700/40 shimmer" />
                <div className="h-4 w-24 bg-zinc-700/40 rounded shimmer" />
              </div>
              <div className="mb-4 h-48 sm:h-60 w-full rounded-[15px] bg-zinc-800/40 shimmer" />
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-zinc-700/40 rounded shimmer" />
                <div className="h-4 w-1/2 bg-zinc-700/40 rounded shimmer" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 w-10 rounded bg-zinc-700/40 shimmer" />
                  <div className="h-6 w-10 rounded bg-zinc-700/40 shimmer" />
                  <div className="h-6 w-10 rounded bg-zinc-700/40 shimmer" />
                </div>
                <div className="mt-4 h-9 w-full rounded-lg bg-zinc-700/40 shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 90%); animation: shimmer 1.6s linear infinite; }
        @keyframes shimmer { to { transform: translateX(100%); } from { transform: translateX(-100%); } }
        @keyframes fade-in { from { opacity:0 } to { opacity:1 } }
        .animate-fade-in { animation: fade-in .4s ease-out; }
      `}</style>
    </main>
  )
}
