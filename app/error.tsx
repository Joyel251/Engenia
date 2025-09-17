"use client"
import { useEffect } from 'react'

// This file catches errors in the current (root) segment in production and development.
// It allows us to display the digest so we can correlate with Vercel function logs.

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError] Caught error boundary:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            An unexpected server error occurred while rendering this page.
            {!!error.digest && (
              <> Use the digest below to look up the detailed stack trace in the deployment logs.</>
            )}
          </p>
          {error.digest && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4 font-mono text-xs break-all">
              digest: {error.digest}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-sm font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
