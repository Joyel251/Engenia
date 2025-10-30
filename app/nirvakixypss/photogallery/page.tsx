"use client";

import { useState } from "react";
import Link from "next/link";

export default function PhotoGalleryAdmin() {
  const [folderUrl, setFolderUrl] = useState("");
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    details?: string;
    totalFound?: number;
    inserted?: number;
  } | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderUrl.trim()) {
      setResult({ error: "Please enter a Google Drive folder URL" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/photogallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderUrl: folderUrl.trim(),
          clearExisting: clearExisting,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          error: data.error || "Failed to import photos",
          details: data.details || data.hint,
        });
      } else {
        setResult(data);
        setFolderUrl(""); // Clear input on success
      }
    } catch (error) {
      setResult({
        error: "Network error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/nirvakixypss/dashboard"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Photo Gallery Management</h1>
          <p className="text-gray-400">Import images from Google Drive folder</p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-purple-300">📋 Setup Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google Cloud Console</a></li>
            <li>Create a new project or select existing one</li>
            <li>Enable <strong>Google Drive API</strong> for your project</li>
            <li>Create credentials → API Key</li>
            <li>Add the API key to your <code className="bg-gray-700 px-2 py-1 rounded">.env</code> file as:
              <pre className="bg-gray-800 p-2 rounded mt-2 overflow-x-auto text-xs">
                GOOGLE_DRIVE_API_KEY=your_api_key_here
              </pre>
            </li>
            <li>Make sure your Google Drive folder is set to <strong>"Anyone with the link can view"</strong></li>
            <li>Copy the folder link and paste it below</li>
          </ol>
        </div>

        {/* Import Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
          <form onSubmit={handleImport} className="space-y-6">
            <div>
              <label htmlFor="folderUrl" className="block text-sm font-medium mb-2">
                Google Drive Folder URL or ID
              </label>
              <input
                type="text"
                id="folderUrl"
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/your-folder-id or just the folder ID"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: Full URL or just the folder ID
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="clearExisting"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                disabled={loading}
              />
              <label htmlFor="clearExisting" className="text-sm">
                Clear existing photos before import (⚠️ This will delete all current photos)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import Photos from Drive</span>
              )}
            </button>
          </form>
        </div>

        {/* Result Messages */}
        {result && (
          <div className={`mt-6 p-4 sm:p-6 rounded-lg border ${
            result.success 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-red-900/20 border-red-500/30'
          }`}>
            {result.success ? (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-green-300 mb-2">✅ Success!</h3>
                <p className="text-green-200">{result.message}</p>
                {result.totalFound !== undefined && (
                  <div className="mt-4 space-y-1 text-sm text-green-300">
                    <p>📷 Total images found: <strong>{result.totalFound}</strong></p>
                    <p>✅ Successfully imported: <strong>{result.inserted}</strong></p>
                  </div>
                )}
                <Link
                  href="/photogallery"
                  className="inline-block mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  View Photo Gallery
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-red-300 mb-2">❌ Error</h3>
                <p className="text-red-200">{result.error}</p>
                {result.details && (
                  <div className="mt-3 p-3 bg-red-950/50 rounded text-sm text-red-300">
                    <strong>Details:</strong> {result.details}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-800/30 rounded-lg border border-gray-700">
          <h3 className="text-base sm:text-lg font-bold mb-3">ℹ️ Important Notes</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• The folder must be publicly accessible (Anyone with the link can view)</li>
            <li>• Only image files will be imported (JPEG, PNG, GIF, WEBP)</li>
            <li>• Large folders may take some time to import</li>
            <li>• The API key should have Google Drive API enabled</li>
            <li>• All imported photos will appear in the photo gallery immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
