# Photo Gallery - Google Drive Auto-Import Setup Guide

## Overview
The photo gallery now supports automatic import of images from Google Drive folders. This means you can upload thousands of photos to a Google Drive folder and import them all at once!

## Setup Instructions

### Step 1: Create Google Cloud Project & Get API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or use existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a name (e.g., "Engenia Photo Gallery")
   - Click "Create"

3. **Enable Google Drive API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your API key will be generated
   - **Copy this key immediately**

5. **Restrict API Key (Recommended for Security)**
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Select only "Google Drive API"
   - Save

### Step 2: Add API Key to Environment Variables

1. Open your `.env` file in the project root
2. Find the line that says `GOOGLE_DRIVE_API_KEY="YOUR_API_KEY_HERE"`
3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Save the file

Example:
```env
GOOGLE_DRIVE_API_KEY="AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Step 3: Prepare Your Google Drive Folder

1. **Create/Select a Folder** in Google Drive with your photos
2. **Make it Publicly Accessible**:
   - Right-click on the folder
   - Click "Share" > "Share"
   - Click "Change to anyone with the link"
   - Set permission to "Viewer"
   - Click "Done"

3. **Copy the Folder Link**
   - Right-click on the folder
   - Click "Get link" or "Copy link"
   - Your link will look like:
     ```
     https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
     ```

### Step 4: Import Photos

1. **Restart your development server** (if running):
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Navigate to Admin Photo Gallery**:
   - Go to: `http://localhost:3000/nirvakixypss/photogallery`
   - Or click the "Photo Gallery" button from the Nirvāṇa dashboard

3. **Import Photos**:
   - Paste your Google Drive folder link
   - Choose whether to clear existing photos (optional)
   - Click "Import Photos from Drive"
   - Wait for the import to complete

4. **View Gallery**:
   - Go to: `http://localhost:3000/photogallery`
   - All your photos should now be visible!

## Features

### ✅ What Works
- Automatically fetches **ALL** images from a Google Drive folder
- Supports thousands of photos
- No need to add individual photo links
- Batch import in seconds
- Supports multiple image formats (JPEG, PNG, GIF, WEBP)
- Option to clear existing photos before import

### 🔄 How It Works
1. You provide a Google Drive folder link
2. The system extracts the folder ID
3. Uses Google Drive API to list all image files
4. Automatically stores each image URL in Supabase
5. Photos appear in the gallery immediately

### 📝 Supported URL Formats
- Full folder URL: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
- Just the folder ID: `1a2b3c4d5e6f7g8h9i0j`

## Troubleshooting

### Error: "Google Drive API key not configured"
- Make sure you added the API key to your `.env` file
- Restart your development server after adding the key

### Error: "No images found in folder"
- Check if the folder is publicly accessible (Anyone with the link)
- Verify the folder contains image files (not just subfolders)
- Make sure the folder ID is correct

### Error: "Failed to fetch images"
- Verify Google Drive API is enabled in your Google Cloud project
- Check if your API key has the correct permissions
- Ensure your API key restrictions allow Google Drive API

### Images Not Loading in Gallery
- The images might take a moment to load from Google Drive
- Check browser console for any CORS errors
- Verify the folder is still publicly accessible

## API Endpoints

### GET `/api/photogallery`
Fetches all photos from the database
```json
{
  "photos": [
    {
      "id": "uuid",
      "driveurl": "https://drive.google.com/file/d/xxx/view",
      "created_at": "2025-10-17T..."
    }
  ],
  "count": 123
}
```

### POST `/api/photogallery`
Imports photos from a Google Drive folder
```json
{
  "folderUrl": "https://drive.google.com/drive/folders/xxx",
  "clearExisting": false
}
```

Response:
```json
{
  "success": true,
  "message": "Successfully imported 500 images",
  "totalFound": 500,
  "inserted": 500
}
```

## Database Schema

The `PhotoGallery` table in Supabase has the following structure:

```sql
CREATE TABLE "PhotoGallery" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driveurl TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Security**: Your Google Drive API key should be kept secret. Never commit it to version control.
2. **Folder Permissions**: Only make folders public that you want to be publicly accessible.
3. **Rate Limits**: Google Drive API has rate limits. For very large folders (10,000+ images), the import might take time.

## Tips for Best Performance

- Keep photos organized in a single folder (not nested)
- Use reasonable image sizes (Google Drive can serve optimized versions)
- For folders with 1000+ images, be patient during import
- Clear browser cache if images don't update immediately

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Check the server logs for API errors
3. Verify all setup steps were completed
4. Ensure Google Drive folder is publicly accessible

---

**Happy Photo Importing! 📸**
