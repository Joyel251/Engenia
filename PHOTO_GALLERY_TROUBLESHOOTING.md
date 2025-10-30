# Photo Gallery - Troubleshooting Guide

## Issue: Images Not Displaying ("Click to View Image" Shows)

### Root Cause
Google Drive has CORS (Cross-Origin Resource Sharing) restrictions that can prevent images from loading directly in websites. The folder sharing settings and URL format are critical.

### ✅ Solution Steps

#### Step 1: Verify Google Drive Folder Settings

1. **Right-click your Google Drive folder** with the photos
2. Click **"Share"**
3. Click **"Change to anyone with the link"**
4. Set permission to **"Viewer"**
5. Click **"Done"**

**IMPORTANT**: Each individual image file should also be accessible. If you uploaded files to a folder that was already shared, they should inherit permissions. Otherwise:
- Select all images in the folder
- Right-click → Share
- Make them accessible to "Anyone with the link"

#### Step 2: Re-Import Photos with New URL Format

The code has been updated to use a better URL format (`https://drive.google.com/uc?export=view&id=FILE_ID`).

**You MUST re-import your photos:**

1. Go to: `http://localhost:3000/nirvakixypss/photogallery`
2. **Check the box**: "Clear existing photos before import"
3. Paste your Google Drive folder link
4. Click "Import Photos from Drive"
5. Wait for the import to complete

#### Step 3: Check Browser Console for Errors

1. Open your photo gallery page: `http://localhost:3000/photogallery`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for error messages

**Common errors and solutions:**

##### Error: "Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE"
- **Cause**: CORS policy blocking
- **Solution**: Make sure the folder is set to "Anyone with the link can view"

##### Error: "403 Forbidden"
- **Cause**: File/folder not publicly accessible
- **Solution**: Re-check sharing settings on both folder AND files

##### Error: "404 Not Found"
- **Cause**: Invalid file ID
- **Solution**: Re-import photos from the folder

#### Step 4: Test with a Single Image

To verify the setup works:

1. Upload a single test image to your Google Drive folder
2. Right-click the image → Get link → Make sure it's set to "Anyone with the link"
3. Re-import the folder
4. Check if the single image loads

#### Step 5: Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Refresh the photo gallery page
4. Look for image requests (filter by "Img")
5. Click on failed requests to see the exact error

### 🔍 Debugging Information

The photo gallery now includes enhanced debugging:

1. Open browser console
2. You'll see logs for:
   - "Image failed to load for photo: [ID]"
   - "Failed URL: [URL]"
   - "Available URLs: [array of URLs]"
   - "Current attempt: [number]"
   - "Trying URL attempt X: [URL]"

This will help identify which URLs are being tried and which are failing.

### 📋 URL Format Attempts

The system automatically tries these URL formats in order:

1. `https://drive.google.com/uc?export=view&id=FILE_ID` ⭐ **Best for embedding**
2. `https://drive.google.com/thumbnail?id=FILE_ID&sz=w2000-h2000`
3. `https://lh3.googleusercontent.com/d/FILE_ID=w2000-h2000`
4. `https://drive.usercontent.google.com/download?id=FILE_ID&export=view`
5. `https://drive.google.com/uc?id=FILE_ID`

### 🚨 Common Issues

#### Issue: "Still showing 'Click to View Image'"
**Causes**:
- Old URLs in database (from before code update)
- Folder not publicly accessible
- Individual files not shared

**Solutions**:
1. ✅ Re-import photos with "Clear existing" checked
2. ✅ Verify folder is public
3. ✅ Check individual file permissions

#### Issue: "Images load slowly"
**Causes**:
- Large image files
- Google Drive API rate limiting
- Network speed

**Solutions**:
- Google Drive automatically optimizes images
- Be patient on first load
- Images will be cached after first view

#### Issue: "Some images load, others don't"
**Causes**:
- Mixed file permissions
- Corrupted image files
- Unsupported formats

**Solutions**:
1. Check file formats (should be: JPG, PNG, GIF, WEBP)
2. Re-upload problematic images
3. Make sure ALL files in folder are shared

### ✅ Expected Behavior

**When working correctly:**
1. Photo gallery loads with thumbnails visible
2. Each thumbnail shows the actual image
3. No "Click to View Image" placeholders (unless image is still loading)
4. Console shows: "Image loaded successfully for photo: [ID]"

**Loading sequence:**
1. Page fetches photo URLs from database
2. For each photo, tries URL format #1
3. If that fails, automatically tries URL format #2
4. Continues until image loads or all formats fail
5. If all fail, shows "Click to View Image" with error state

### 🔧 Advanced Debugging

If images still don't load:

1. **Check the actual URL in database**:
   - Go to your Supabase dashboard
   - Open the `PhotoGallery` table
   - Check the `driveurl` column
   - URLs should start with: `https://drive.google.com/uc?export=view&id=`

2. **Test URL directly**:
   - Copy a URL from the database
   - Paste it in a new browser tab
   - If it downloads/shows the image, the URL is good
   - If you get an error, the sharing is wrong

3. **Test with curl** (in terminal):
   ```bash
   curl -I "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID"
   ```
   - Should return `200 OK`
   - If `403 Forbidden`, sharing issue
   - If `404 Not Found`, invalid ID

### 📞 Still Not Working?

If you've tried everything above and images still don't load:

1. **Check browser console** for specific error messages
2. **Share the error message** from console
3. **Verify folder link** is correct
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Clear browser cache** and reload

### 🎯 Quick Checklist

- [ ] Google Drive folder is set to "Anyone with the link can view"
- [ ] Individual images inherit public sharing
- [ ] Re-imported photos with "Clear existing" checked
- [ ] Using the updated code (with new URL format)
- [ ] Checked browser console for errors
- [ ] Tested folder link in a private/incognito window
- [ ] Google Drive API key is correctly set in `.env`
- [ ] Dev server was restarted after .env changes

---

**Need more help?** Check the browser console and share the specific error message for more targeted assistance.
