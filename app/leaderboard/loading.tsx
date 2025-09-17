export default function Loading() {
  return (
    <main className="relative min-h-screen w-full px-4 md:px-10 pt-24 pb-24 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-pulse w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.05),transparent_70%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 md:h-16 w-64 mx-auto rounded bg-zinc-800/50 animate-pulse" />
          <div className="mt-4 h-4 w-80 mx-auto rounded bg-zinc-800/40 animate-pulse" />
        </div>
        <div className="mb-16 flex items-end justify-center gap-6 md:gap-12">
          <div className="w-24 md:w-32 h-40 rounded-t-xl bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 animate-pulse" />
          <div className="w-28 md:w-40 h-56 rounded-t-xl bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 animate-pulse" />
          <div className="w-20 md:w-28 h-32 rounded-t-xl bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 animate-pulse">
              <div className="rounded-xl bg-black/40 p-6 h-64" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
