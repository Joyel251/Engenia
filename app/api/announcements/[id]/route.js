import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  try {
    const { data: updated, error } = await supabaseAdmin
      .from(TABLES.ANNOUNCEMENTS)
      .update({ 
        title: body.title, 
        content: body.content 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating announcement:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const { error } = await supabaseAdmin
      .from(TABLES.ANNOUNCEMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
