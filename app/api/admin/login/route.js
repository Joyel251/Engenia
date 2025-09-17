import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { generateTokenEdge } from "@/lib/edge-auth";

export async function POST(req) {
  const { username, password } = await req.json();

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const valid = await comparePassword(password, admin.password);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // Use edge-compatible token generation
  const token = await generateTokenEdge(admin.id);
  return NextResponse.json({ token });
}