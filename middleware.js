// middleware.js - Enhanced with DDoS protection
import { NextResponse } from "next/server";
import { verifyTokenEdge } from "./lib/edge-auth";

// ==================== RATE LIMITING ====================
// In-memory rate limit store (persists during server runtime)
const rateLimitStore = new Map();

// Rate limit configurations
const RATE_LIMITS = {
  admin_login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  admin_routes: { maxRequests: 100, windowMs: 60 * 1000 },   // 100 requests per minute
  api_write: { maxRequests: 30, windowMs: 60 * 1000 },       // 30 writes per minute
  api_read: { maxRequests: 200, windowMs: 60 * 1000 },       // 200 reads per minute
  nirvakixypss: { maxRequests: 50, windowMs: 60 * 1000 },    // 50 requests per minute
};

// Suspicious IP tracker (blocks after too many failures)
const suspiciousIPs = new Map();
const SUSPICIOUS_THRESHOLD = 10;

function getRateLimitKey(ip, route) {
  return `${ip}:${route}`;
}

function checkRateLimit(ip, route, limit) {
  const key = getRateLimitKey(ip, route);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    const resetTime = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: limit.maxRequests - 1, resetTime };
  }

  if (record.count >= limit.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

function trackSuspiciousActivity(ip) {
  const current = suspiciousIPs.get(ip) || 0;
  suspiciousIPs.set(ip, current + 1);
}

function isSuspiciousIP(ip) {
  return (suspiciousIPs.get(ip) || 0) >= SUSPICIOUS_THRESHOLD;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  // Reset suspicious IPs after 1 hour
  for (const [ip, count] of suspiciousIPs.entries()) {
    if (count > 0) {
      suspiciousIPs.set(ip, Math.max(0, count - 1));
    }
  }
}, 5 * 60 * 1000);

// ==================== MIDDLEWARE CONFIG ====================
export const config = {
  matcher: [
    "/api/winners/:path*",
    "/api/announcements/:path*",
    "/api/admin/reset",
    "/api/departments/bonus",
    "/api/admin/login",
    "/api/events/:path*",
    "/api/departments/:path*",
    "/api/launchstatus",
    "/api/nirvakixypss/:path*",
    "/admin/:path*",
    "/nirvakixypss/:path*"
  ],
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  console.log("🔍 Middleware called for:", req.method, pathname);
  
  // Get client IP
  const ip = req.ip || 
    req.headers.get('x-forwarded-for')?.split(',')[0] || 
    req.headers.get('x-real-ip') || 
    'unknown';

  // ==================== BLOCK SUSPICIOUS IPS ====================
  if (isSuspiciousIP(ip)) {
    console.log("🚫 Blocked suspicious IP:", ip);
    return NextResponse.json(
      { error: 'Access denied. Too many failed attempts.' },
      { status: 403 }
    );
  }

  // ==================== ADMIN LOGIN PROTECTION ====================
  if (pathname === '/api/admin/login') {
    const { allowed, remaining, resetTime } = checkRateLimit(
      ip,
      'admin_login',
      RATE_LIMITS.admin_login
    );

    if (!allowed) {
      trackSuspiciousActivity(ip);
      console.log("⚠️ Rate limit exceeded for admin login:", ip);
      return NextResponse.json(
        {
          error: 'Too many login attempts. Try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMITS.admin_login.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime)
          }
        }
      );
    }

    console.log(`✅ Admin login rate limit OK (${remaining} remaining)`);
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  }

  // ==================== NIRVAKIXYPSS ROUTE PROTECTION ====================
  if (pathname.startsWith('/nirvakixypss')) {
    const { allowed, remaining } = checkRateLimit(
      ip,
      'nirvakixypss',
      RATE_LIMITS.nirvakixypss
    );

    if (!allowed) {
      console.log("⚠️ Rate limit exceeded for nirvakixypss:", ip);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    console.log(`✅ Nirvakixypss rate limit OK (${remaining} remaining)`);
  }

  // ==================== PAYLOAD SIZE CHECK ====================
  const contentLength = req.headers.get('content-length');
  const maxPayloadSize = 1024 * 1024; // 1MB
  
  if (contentLength && parseInt(contentLength) > maxPayloadSize) {
    console.log("⚠️ Payload too large:", contentLength);
    return NextResponse.json(
      { error: 'Payload too large. Maximum 1MB allowed.' },
      { status: 413 }
    );
  }

  // ==================== API WRITE OPERATIONS PROTECTION ====================
  const writeEndpoints = [
    '/api/winners',
    '/api/events',
    '/api/departments',
    '/api/announcements',
    '/api/admin/reset',
    '/api/departments/bonus',
    '/api/launchstatus'
  ];
  
  const isWriteOp = writeEndpoints.some(ep => pathname.startsWith(ep)) && 
                    ['POST', 'PUT', 'DELETE'].includes(req.method);

  if (isWriteOp) {
    // Check rate limit for write operations
    const { allowed, remaining } = checkRateLimit(
      ip,
      'api_write',
      RATE_LIMITS.api_write
    );

    if (!allowed) {
      trackSuspiciousActivity(ip);
      console.log("⚠️ Rate limit exceeded for write operations:", ip, pathname);
      return NextResponse.json(
        { error: 'Too many write operations. Please slow down.' },
        { status: 429 }
      );
    }

    console.log(`✅ Write operation rate limit OK (${remaining} remaining)`);
  }

  // ==================== API READ OPERATIONS PROTECTION ====================
  if (pathname.startsWith('/api/') && !isWriteOp) {
    const { allowed, remaining } = checkRateLimit(
      ip,
      'api_read',
      RATE_LIMITS.api_read
    );

    if (!allowed) {
      console.log("⚠️ Rate limit exceeded for read operations:", ip, pathname);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    console.log(`✅ Read operation rate limit OK (${remaining} remaining)`);
  }

  // ==================== ORIGINAL AUTHENTICATION LOGIC ====================
  // Protect /admin/* routes for all methods
  if (pathname.startsWith('/admin')) {
    const authHeader = req.headers.get("Authorization");
    console.log("📋 Auth header:", authHeader);
    
    if (!authHeader?.startsWith("Bearer ")) {
      trackSuspiciousActivity(ip);
      console.log("❌ No Bearer token found");
      return NextResponse.json(
        { error: "Unauthorized - No Bearer token" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    console.log("🎫 Extracted token:", token?.substring(0, 20) + "...");
    
    // Use async token verification for Edge Runtime
    const payload = await verifyTokenEdge(token);
    console.log("✅ Token payload:", payload);
    
    if (!payload) {
      trackSuspiciousActivity(ip);
      console.log("❌ Token verification failed");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    console.log("✅ Authentication successful");
  }

  // ==================== PROTECTED API ROUTES AUTHENTICATION ====================
  const protectedAPIs = [
    '/api/winners',
    '/api/announcements',
    '/api/admin/reset',
    '/api/departments/bonus'
  ];

  const needsAuth = protectedAPIs.some(api => pathname.startsWith(api)) &&
                    ['POST', 'PUT', 'DELETE'].includes(req.method);

  if (needsAuth) {
    const authHeader = req.headers.get("Authorization");
    const cookieToken = req.cookies.get('admin_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      trackSuspiciousActivity(ip);
      console.log("❌ Authentication required for:", pathname);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      trackSuspiciousActivity(ip);
      console.log("❌ Invalid token for:", pathname);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("✅ API authentication successful");
  }

  // ==================== ADDITIONAL SECURITY HEADERS ====================
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}