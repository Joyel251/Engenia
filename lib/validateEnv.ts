// Centralized environment variable validation & diagnostics
// This runs only on the server (no bundling into client because imported from server files only)

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET'
]

let validated = false

export function validateEnv() {
  if (validated) return
  validated = true
  const missing = REQUIRED_VARS.filter(k => !process.env[k])
  if (missing.length) {
    console.error('[ENV] Missing required environment variables:', missing.join(', '))
  } else {
    // Light confirmation (avoid dumping secrets)
    console.log('[ENV] All required environment variables present:', REQUIRED_VARS.map(k => `${k}=✔`).join(' '))
  }
}

// Optional helper to safely access an env var (avoids undefined surprises)
export function getEnv(name: string) {
  const v = process.env[name]
  if (!v) {
    console.error(`[ENV] Accessed missing variable ${name}`)
  }
  return v
}
