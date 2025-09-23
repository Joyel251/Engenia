import { NextResponse } from "next/server";
import { verifyTokenEdge } from "./lib/edge-auth";

export const config = {
  matcher: ["/api/winners/:path*", "/api/announcements/:path*", "/api/admin/reset", "/api/departments/bonus"],
};

export async function middleware(req) {
  console.log("🔍 Middleware called for:", req.method, req.nextUrl.pathname);
  
  // Only protect POST and DELETE requests (and the reset endpoint which is POST)
  if (req.method === "POST" || req.method === "DELETE") {
    const authHeader = req.headers.get("Authorization");
    console.log("📋 Auth header:", authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("❌ No Bearer token found");
      return NextResponse.json({ error: "Unauthorized - No Bearer token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("🎫 Extracted token:", token?.substring(0, 20) + "...");
    
    // Use async token verification for Edge Runtime
    const payload = await verifyTokenEdge(token);
    console.log("✅ Token payload:", payload);

    if (!payload) {
      console.log("❌ Token verification failed");
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    console.log("✅ Authentication successful");
  }

  return NextResponse.next();
}