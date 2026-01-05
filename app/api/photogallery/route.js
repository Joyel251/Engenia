import { NextResponse } from "next/server";
import { supabaseAdmin, TABLES } from "@/lib/supabase";
import { google } from 'googleapis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division');

    let query = supabaseAdmin
      .from(TABLES.PHOTO_GALLERY)
      .select("id, driveurl, created_at, division", { count: 'exact' });

    // Filter by division if provided
    if (division && (division === 'ONSTAGE' || division === 'OFFSTAGE')) {
      query = query.eq('division', division);
    }

    // Fetch all results by using a large limit and pagination if needed
    let allData = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allData = allData.concat(data);
        from += batchSize;
        
        // Check if we've fetched all records
        if (data.length < batchSize || (count !== null && allData.length >= count)) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    return NextResponse.json({ 
      photos: allData || [],
      count: allData?.length || 0
    }, { status: 200 });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch photos", details: error.message }, 
      { status: 500 }
    );
  }
}

// Extract folder ID from various Google Drive folder URL formats
function extractFolderId(url) {
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]+)$/  // Direct folder ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// POST endpoint to fetch images from a Google Drive folder
export async function POST(request) {
  try {
    const body = await request.json();
    const { folderUrl, clearExisting, division } = body;

    if (!folderUrl) {
      return NextResponse.json(
        { error: "Folder URL is required" },
        { status: 400 }
      );
    }

    // Extract folder ID from URL
    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      return NextResponse.json(
        { error: "Invalid Google Drive folder URL" },
        { status: 400 }
      );
    }

    // Check if Google Drive API credentials are configured
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Drive API key not configured. Please add GOOGLE_DRIVE_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    // Initialize Google Drive API
    const drive = google.drive({
      version: 'v3',
      auth: apiKey
    });

    // Fetch all image files from the folder
    let allFiles = [];
    let pageToken = null;

    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/gif' or mimeType = 'image/webp' or mimeType = 'image/jpg') and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, createdTime, webViewLink, webContentLink)',
        pageSize: 1000,
        pageToken: pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      if (response.data.files && response.data.files.length > 0) {
        allFiles = allFiles.concat(response.data.files);
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    if (allFiles.length === 0) {
      return NextResponse.json(
        { 
          error: "No images found in folder. Make sure the folder is publicly accessible or shared with 'Anyone with the link'.",
          folderId: folderId
        },
        { status: 404 }
      );
    }

    // Clear existing photos if requested (optionally filtered by division)
    if (clearExisting) {
      let deleteQuery = supabaseAdmin
        .from(TABLES.PHOTO_GALLERY)
        .delete();

      // If division is specified, only clear photos from that division
      if (division && (division === 'ONSTAGE' || division === 'OFFSTAGE')) {
        deleteQuery = deleteQuery.eq('division', division);
      } else {
        deleteQuery = deleteQuery.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      }
      
      const { error: deleteError } = await deleteQuery;
      
      if (deleteError) {
        console.error('Error clearing existing photos:', deleteError);
      }
    }

    // Log file permissions for debugging
    console.log(`Found ${allFiles.length} images in folder`);
    console.log('Sample file:', allFiles[0]?.name, allFiles[0]?.id);
    console.log('Division:', division || 'none');

    // Prepare photo data for insertion
    // Using multiple URL formats to maximize compatibility
    const photoData = allFiles.map(file => {
      // Use webContentLink if available (direct download link)
      // Otherwise use the uc?export=view format
      const directUrl = file.webContentLink || `https://drive.google.com/uc?export=view&id=${file.id}`;
      const photoEntry = {
        driveurl: directUrl,
        created_at: file.createdTime || new Date().toISOString()
      };
      
      // Add division if specified
      if (division && (division === 'ONSTAGE' || division === 'OFFSTAGE')) {
        photoEntry.division = division;
      }
      
      return photoEntry;
    });

    // Insert photos in batches (Supabase has a limit)
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < photoData.length; i += batchSize) {
      const batch = photoData.slice(i, i + batchSize);
      const { data, error } = await supabaseAdmin
        .from(TABLES.PHOTO_GALLERY)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      insertedCount += data?.length || 0;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount} images from Google Drive folder`,
      folderId: folderId,
      totalFound: allFiles.length,
      inserted: insertedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching from Google Drive:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch images from Google Drive",
        details: error.message,
        hint: "Make sure the folder is publicly accessible and shared with 'Anyone with the link'"
      },
      { status: 500 }
    );
  }
}
