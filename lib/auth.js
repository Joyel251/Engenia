import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(adminId) {
  console.log("🏭 Generating token for adminId:", adminId);
  console.log("🔑 Using SECRET:", SECRET?.substring(0, 10) + "...");
  const token = jwt.sign({ adminId }, SECRET, { expiresIn: "1d" });
  console.log("🎫 Generated token:", token?.substring(0, 20) + "...");
  return token;
}

export function verifyToken(token) {
  console.log("🔍 Verifying token:", token?.substring(0, 20) + "...");
  console.log("🔑 Using SECRET:", SECRET?.substring(0, 10) + "...");
  
  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("✅ Token verified successfully:", decoded);
    return decoded;
  } catch (error) {
    console.log("❌ Token verification error:", error.message);
    return null;
  }
}