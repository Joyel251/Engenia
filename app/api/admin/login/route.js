import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";
import { comparePassword } from "@/lib/auth";
import { generateTokenEdge } from "@/lib/edge-auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    console.log("🔍 Admin login attempt:", username);

    const { data: admin, error } = await supabaseAdmin
      .from(TABLES.ADMIN)
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      console.log("❌ Admin not found:", username);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (error) throw error;

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      console.log("❌ Invalid password for:", username);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Use edge-compatible token generation
    console.log("🎫 Generating token for admin:", admin.id);
    const token = await generateTokenEdge(admin.id);
    console.log("✅ Token generated successfully");
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("💥 Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}