// app/api/admin/login/route.js
// Enhanced version with DDoS protection
import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

// Failed login tracker per IP
const failedLogins = new Map()
const LOCKOUT_DURATION = 2 * 60 * 1000 // 15 minutes
const MAX_FAILED_ATTEMPTS = 3

// Add deliberate delay to slow down brute force
function addDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getClientIP(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ||
         req.headers.get('x-real-ip') ||
         'unknown'
}

function trackFailedAttempt(ip) {
  const record = failedLogins.get(ip) || { count: 0, lockedUntil: null }
  record.count++
  record.lastAttempt = Date.now()
  
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION
  }
  
  failedLogins.set(ip, record)
  
  // Auto-cleanup after lockout expires
  setTimeout(() => {
    const current = failedLogins.get(ip)
    if (current && Date.now() > current.lockedUntil) {
      failedLogins.delete(ip)
    }
  }, LOCKOUT_DURATION)
}

function isLocked(ip) {
  const record = failedLogins.get(ip)
  if (!record || !record.lockedUntil) return false
  
  if (Date.now() < record.lockedUntil) {
    return true
  }
  
  // Lockout expired, clear it
  failedLogins.delete(ip)
  return false
}

function resetFailedAttempts(ip) {
  failedLogins.delete(ip)
}

export async function POST(req) {
  try {
    const ip = getClientIP(req)
    
    // Check if IP is locked out
    if (isLocked(ip)) {
      const record = failedLogins.get(ip)
      const remainingTime = Math.ceil((record.lockedUntil - Date.now()) / 1000)
      
      console.log(`🚫 Locked out IP attempting login: ${ip}`)
      await addDelay(5000) // 5 second penalty for locked IPs
      
      return NextResponse.json(
        {
          error: 'Too many failed attempts. Account temporarily locked.',
          retryAfter: remainingTime
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(remainingTime)
          }
        }
      )
    }

    const body = await req.json()
    const { username, password } = body

    // Input validation
    if (!username || !password) {
      trackFailedAttempt(ip)
      await addDelay(2000) // 2 second delay
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    // Prevent SQL injection / buffer overflow attempts
    if (username.length > 50 || password.length > 100) {
      trackFailedAttempt(ip)
      console.log(`⚠️ Suspicious input length from ${ip}`)
      await addDelay(3000)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Sanitize input
    const sanitizedUsername = String(username).trim()

    // Fetch admin from database
    const { data: admin, error } = await supabaseAdmin
      .from(TABLES.ADMIN)
      .select('*')
      .eq('username', sanitizedUsername)
      .single()

    if (error || !admin) {
      trackFailedAttempt(ip)
      console.log(`❌ Failed login attempt for user: ${sanitizedUsername} from ${ip}`)
      await addDelay(2000) // Always delay on failure
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      trackFailedAttempt(ip)
      console.log(`❌ Wrong password for user: ${sanitizedUsername} from ${ip}`)
      await addDelay(2000)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // SUCCESS - Clear failed attempts
    resetFailedAttempts(ip)
    console.log(`✅ Successful login: ${sanitizedUsername} from ${ip}`)

    // Update last login
    await supabaseAdmin
      .from(TABLES.ADMIN)
      .update({
        lastLogin: new Date().toISOString(),
        loginIP: ip
      })
      .eq('username', sanitizedUsername)

    // Generate JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )
    
    const token = await new SignJWT({ username: sanitizedUsername })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .setJti(crypto.randomUUID())
      .sign(secret)

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Login successful'
    })

    // Set httpOnly cookie as backup
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('❌ Login error:', error)
    await addDelay(2000)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Block other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}