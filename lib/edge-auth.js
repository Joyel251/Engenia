// Edge Runtime compatible JWT functions
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateTokenEdge(adminId) {
  const jwt = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET);
    
  return jwt;
}

export async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    console.log("❌ Token verification error:", error.message);
    return null;
  }
}