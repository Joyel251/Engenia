import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.PHOTO_GALLERY)
      .select("id, driveurl, created_at") // Changed from drive_url to driveurl
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return NextResponse.json({ 
      photos: data || [],
      count: data?.length || 0
    }, { status: 200 });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch photos", details: error.message }, 
      { status: 500 }
    );
  }
}
