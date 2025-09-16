// app/api/announcements/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(announcements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, content } = await req.json();

    const announcement = await prisma.announcement.create({
      data: { title, content },
    });

    return NextResponse.json(announcement);
  } catch (err) {
    console.error("Error creating announcement:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
