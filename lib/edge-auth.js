// Edge Runtime compatible JWT functions
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-engenia-2025');

export async function generateTokenEdge(adminId) {
  console.log("🔑 Using JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Missing, using fallback");
  console.log("🏭 Generating edge token for adminId:", adminId);
  
  const jwt = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET);
    
  console.log("🎫 Edge token generated:", jwt?.substring(0, 30) + "...");
  return jwt;
}

export async function verifyTokenEdge(token) {
  try {
    console.log("🔍 Verifying edge token:", token?.substring(0, 30) + "...");
    console.log("🔑 Using JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Missing, using fallback");
    
    const { payload } = await jwtVerify(token, SECRET);
    console.log("✅ Edge token verified:", payload);
    return payload;
  } catch (error) {
    console.log("❌ Token verification error:", error.message);
    return null;
  }
}