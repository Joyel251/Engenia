// app/api/announcements/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";
import { randomUUID } from 'crypto';

export async function GET(req) {
  try {
    const { data: announcements, error } = await supabaseAdmin
      .from(TABLES.ANNOUNCEMENTS)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(announcements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const announcementId = randomUUID();
    const now = new Date().toISOString();
    const { data: announcement, error } = await supabaseAdmin
      .from(TABLES.ANNOUNCEMENTS)
      .insert([{ 
        id: announcementId,
        title: title.trim(), 
        content: content.trim(),
        createdAt: now,
        updatedAt: now
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(announcement);
  } catch (err) {
    console.error("Error creating announcement:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
