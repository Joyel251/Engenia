"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import BubbleMenu from "@/components/BubbleMenu";
import nextDynamic from 'next/dynamic'

const Beams = nextDynamic(() => import('@/components/Beams'), { ssr: false })

const menuItems = [
  {
    label: 'home',
    href: '/home',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'events',
    href: '/events',
    ariaLabel: 'Events',
    rotation: 8,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'leaderboard',
    href: '/leaderboard',
    ariaLabel: 'Leaderboard',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'photogallery',
    href: '/photogallery',
    ariaLabel: 'Photo Gallery',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'updates',
    href: '/announcements',
    ariaLabel: 'Updates & Announcements',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
];

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  // Fix: Change the ref type to hold IntersectionObserver, not DOM element
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer with optimized settings
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.getAttribute('data-animate-id');
          if (entry.isIntersecting) {
            setVisibleElements(prev => {
              const arr = Array.from(prev);
              if (elementId && !arr.includes(elementId)) {
                arr.push(elementId);
              }
              return new Set(arr);
            });
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '-50px 0px', // Start animation 50px before element is in view
      }
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Fix: The observeElement function should accept HTMLElement
  const observeElement = (element: HTMLElement | null) => {
    if (observer.current && element) {
      observer.current.observe(element);
    }
  };

  return { visibleElements, observeElement };
};

// Convert Google Drive URL to direct CDN URL (bypasses proxy)
const getDirectCdnUrl = (driveurl: string, size: 'thumbnail' | 'full' = 'full') => {
  if (!driveurl || typeof driveurl !== 'string') {
    return '';
  }

  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    /\/uc\?export=view&id=([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /uc\?id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{25,})$/  // Direct file ID
  ];

  let fileId = null;
  for (const pattern of patterns) {
    const match = driveurl.match(pattern);
    if (match && match[1]) {
      fileId = match[1];
      break;
    }
  }

  if (fileId) {
    if (size === 'thumbnail') {
      // For gallery grid - optimized size (800x800)
      return `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`;
    } else {
      // For full-size modal and downloads - high quality (4000px max)
      return `https://lh3.googleusercontent.com/d/${fileId}=s4000`;
    }
  }

  // Fallback to original URL if no pattern matches
  return driveurl;
};

// Multiple Google Drive URL formats to try (fallback system)
const getMultipleDriveUrls = (driveurl: string) => {
  const directUrl = getDirectCdnUrl(driveurl, 'full');
  
  // Return array with primary CDN URL and fallbacks
  return [
    directUrl,
    getDirectCdnUrl(driveurl, 'thumbnail'),
  ].filter(url => url && url !== '');
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<Array<{ id: string; driveurl: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [urlAttempts, setUrlAttempts] = useState<Record<string, number>>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; index: number } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'offstage' | 'onstage'>('offstage');
  const [offstageCount, setOffstageCount] = useState(0);
  const [onstageCount, setOnstageCount] = useState(0);
  
  const { visibleElements, observeElement } = useScrollAnimation();
  const titleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Fetch counts for both categories on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch offstage count
        const offstageResponse = await fetch('/api/photogallery?division=OFFSTAGE', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (offstageResponse.ok) {
          const offstageData = await offstageResponse.json();
          setOffstageCount(offstageData.photos?.length || 0);
        }

        // Fetch onstage count
        const onstageResponse = await fetch('/api/photogallery?division=ONSTAGE', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (onstageResponse.ok) {
          const onstageData = await onstageResponse.json();
          setOnstageCount(onstageData.photos?.length || 0);
        }
      } catch (err) {
        console.error('Failed to fetch photo counts:', err);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build URL with division filter
        const division = selectedCategory.toUpperCase(); // 'offstage' -> 'OFFSTAGE', 'onstage' -> 'ONSTAGE'
        const url = `/api/photogallery?division=${division}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log('Fetched photos:', data.photos);
        setPhotos(data.photos || []);
        
      } catch (err) {
        console.error('Fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load photos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [selectedCategory]);

  // Setup scroll observers
  useEffect(() => {
    if (titleRef.current) {
      observeElement(titleRef.current);
    }
    if (statsRef.current) {
      observeElement(statsRef.current);
    }
    if (categoriesRef.current) {
      observeElement(categoriesRef.current);
    }
  }, [loading, observeElement]);

  const handleImageError = (photoId: string, driveurl: string) => {
    console.error('Image failed to load for photo:', photoId);
    console.error('Failed URL:', driveurl);
    
    const availableUrls = getMultipleDriveUrls(driveurl);
    const currentAttempt = urlAttempts[photoId] || 0;
    
    console.log('Available URLs:', availableUrls);
    console.log('Current attempt:', currentAttempt);
    
    if (currentAttempt < availableUrls.length - 1) {
      console.log(`Trying URL attempt ${currentAttempt + 1} for photo ${photoId}:`, availableUrls[currentAttempt + 1]);
      setUrlAttempts(prev => ({
        ...prev,
        [photoId]: currentAttempt + 1
      }));
    } else {
      console.error(`All URL attempts failed for photo ${photoId}`);
      setImageErrors(prev => ({
        ...prev,
        [photoId]: true
      }));
    }
  };

  const handleImageLoad = (photoId: string) => {
    console.log('Image loaded successfully for photo:', photoId);
    setImageErrors(prev => ({
      ...prev,
      [photoId]: false
    }));
  };

  const handleRetry = () => {
    setError(null);
    setImageErrors({});
    setUrlAttempts({});
    setLoading(true);
    window.location.reload();
  };

  const openImageModal = (url: string, index: number) => {
    setSelectedImage({ url, index });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage || photos.length === 0) return;
    
    let newIndex = selectedImage.index;
    if (direction === 'prev') {
      newIndex = (selectedImage.index - 1 + photos.length) % photos.length;
    } else {
      newIndex = (selectedImage.index + 1) % photos.length;
    }
    
    const newPhoto = photos[newIndex];
    const newUrl = getDirectCdnUrl(newPhoto.driveurl, 'full');
    
    setSelectedImage({ url: newUrl, index: newIndex });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, photos]);

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedPhotos(new Set());
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  // Select all photos
  const selectAllPhotos = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)));
  };

  // Deselect all photos
  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  // Download single image
  const downloadSingleImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  // Download selected images
  const downloadSelectedImages = async () => {
    if (selectedPhotos.size === 0) {
      alert('Please select at least one image to download');
      return;
    }

    setDownloading(true);

    try {
      // If only one image selected, download it directly
      if (selectedPhotos.size === 1) {
        const photoId = Array.from(selectedPhotos)[0];
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
          const url = getDirectCdnUrl(photo.driveurl, 'full');
          await downloadSingleImage(url, `photo-${photoId}.jpg`);
        }
      } else {
        // Download multiple images using JSZip
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // Add selected images to zip
        let count = 0;
        const selectedPhotoIds = Array.from(selectedPhotos);
        for (const photoId of selectedPhotoIds) {
          const photo = photos.find(p => p.id === photoId);
          if (photo) {
            const url = getDirectCdnUrl(photo.driveurl, 'full');

            try {
              const response = await fetch(url);
              const blob = await response.blob();
              const index = photos.findIndex(p => p.id === photoId);
              zip.file(`photo-${index + 1}.jpg`, blob);
              count++;
            } catch (error) {
              console.error(`Failed to add image ${photoId} to zip:`, error);
            }
          }
        }

        if (count > 0) {
          // Generate and download zip
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const zipUrl = window.URL.createObjectURL(zipBlob);
          const link = document.createElement('a');
          link.href = zipUrl;
          link.download = `photos-${count}-images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(zipUrl);
        }
      }

      // Clear selection after download
      setSelectedPhotos(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download images');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-foreground overflow-hidden" style={{backgroundColor: 'transparent'}}>
      {/* BubbleMenu Navigation - Hidden when modal is open */}
      {!selectedImage && (
        <BubbleMenu
          logo="/logo5.png"
          items={menuItems}
          menuAriaLabel="Toggle navigation"
          menuBg="rgba(255, 255, 255, 0.95)"
          menuContentColor="#111111"
          useFixedPosition={true}
          animationEase="back.out(1.5)"
          animationDuration={0.6}
          staggerDelay={0.1}
        />
      )}

      {/* Beams Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#00bcd4" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        {/* Scroll-animated Title */}
        <div 
          ref={titleRef}
          data-animate-id="title"
          className={`overflow-hidden transition-all duration-1000 ease-out ${
            visibleElements.has('title') || !loading
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-12 opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-center font-mono drop-shadow-2xl text-white">
            Photo Gallery
          </h1>

          {/* Category Selection Cards */}
          <div 
            ref={categoriesRef}
            data-animate-id="categories"
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8 transition-all duration-1000 ease-out ${
              visibleElements.has('categories') || !loading
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-12 opacity-0'
            }`}
          >
            {/* Offstage Events Card */}
            <button
              onClick={() => setSelectedCategory('offstage')}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                selectedCategory === 'offstage'
                  ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500 shadow-lg shadow-purple-500/50'
                  : 'bg-zinc-900/60 border-zinc-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === 'offstage' ? 'bg-purple-600' : 'bg-zinc-800'
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-mono mb-2">Offstage Events</h3>
                  <p className="text-zinc-300 text-sm font-mono">
                    {offstageCount} photos available
                  </p>
                </div>
                {selectedCategory === 'offstage' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Onstage Events Card */}
            <button
              onClick={() => setSelectedCategory('onstage')}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                selectedCategory === 'onstage'
                  ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500 shadow-lg shadow-blue-500/50'
                  : 'bg-zinc-900/60 border-zinc-700 hover:border-blue-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === 'onstage' ? 'bg-blue-600' : 'bg-zinc-800'
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-mono mb-2">Onstage Events</h3>
                  <p className="text-zinc-300 text-sm font-mono">
                    {onstageCount} photos available
                  </p>
                </div>
                {selectedCategory === 'onstage' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Download Controls */}
          {!loading && !error && photos.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {!selectionMode ? (
                <button
                  onClick={toggleSelectionMode}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Select Photos
                </button>
              ) : (
                <>
                  <button
                    onClick={selectAllPhotos}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-mono text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllPhotos}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-mono text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={downloadSelectedImages}
                    disabled={selectedPhotos.size === 0 || downloading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-mono font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download ({selectedPhotos.size})
                      </>
                    )}
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white/60 mx-auto mb-6"></div>
              <div className="animate-ping absolute top-0 left-0 h-16 w-16 rounded-full border-2 border-white/20"></div>
            </div>
            <p className="text-zinc-300 text-lg font-mono animate-pulse">Loading gallery...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-24 animate-fade-in">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
              <p className="text-red-300 text-lg mb-4 font-mono animate-bounce">⚠️ {error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-mono font-bold transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !photos.length && (
          <div className="text-center py-24 animate-fade-in">
            <div className="bg-zinc-800/40 border border-zinc-600/30 rounded-lg p-8 max-w-md mx-auto backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
              <div className="animate-bounce mb-4">
                <svg className="mx-auto h-16 w-16 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-300 text-lg font-mono">Photos will be uploaded soon.</p>
              <p className="text-zinc-500 text-sm mt-2 font-mono animate-pulse">Check back later for updates!</p>
            </div>
          </div>
        )}

        {/* Scroll-animated Photo Grid */}
        {!loading && !error && photos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {photos.map((photo, index) => {
                if (!photo || !photo.driveurl) {
                  return null;
                }

                const availableUrls = getMultipleDriveUrls(photo.driveurl);
                const currentAttempt = urlAttempts[photo.id] || 0;
                const currentUrl = availableUrls[currentAttempt];
                const hasError = imageErrors[photo.id];
                const animateId = `photo-${index}`;
                const isSelected = selectedPhotos.has(photo.id);
                
                // Use optimized thumbnail URL for grid view
                const thumbnailUrl = getDirectCdnUrl(photo.driveurl, 'thumbnail');
                const fullUrl = getDirectCdnUrl(photo.driveurl, 'full');

                return (
                  <div 
                    key={photo.id || `photo-${index}`}
                    ref={(el) => {
                      if (el) {
                        el.setAttribute('data-animate-id', animateId);
                        observeElement(el);
                      }
                    }}
                    data-animate-id={animateId}
                    className={`group relative rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm
                      transform transition-all duration-700 ease-out
                      hover:scale-105 hover:shadow-white/20 hover:-translate-y-2
                      ${isSelected ? 'ring-4 ring-blue-500 scale-105' : 'bg-zinc-900/60 border border-white/10'}
                      ${selectionMode ? 'cursor-pointer' : ''}
                      ${visibleElements.has(animateId)
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-8 opacity-0 scale-95'
                      }`}
                    style={{
                      transitionDelay: `${(index % 4) * 150}ms`, // Stagger by row
                    }}
                    onClick={() => {
                      if (selectionMode) {
                        togglePhotoSelection(photo.id);
                      } else if (thumbnailUrl) {
                        openImageModal(fullUrl, index);
                      }
                    }}
                  >
                    {/* Selection Checkbox */}
                    {selectionMode && (
                      <div className="absolute top-2 left-2 z-20">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isSelected ? 'bg-blue-600' : 'bg-black/60 backdrop-blur-sm'
                        }`}>
                          {isSelected && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Download Button (Individual) */}
                    {!selectionMode && thumbnailUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSingleImage(fullUrl, `photo-${index + 1}.jpg`);
                        }}
                        className="absolute top-2 left-2 z-20 p-2 bg-black/60 hover:bg-blue-600 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                        title="Download this image"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}

                    <div className="relative w-full h-56 bg-zinc-800 overflow-hidden">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={`Gallery Photo ${index + 1}`}
                            fill
                            className="object-cover transition-all duration-700 ease-out transform group-hover:scale-110 group-hover:rotate-1"
                            onError={() => handleImageError(photo.id, photo.driveurl)}
                            onLoad={() => handleImageLoad(photo.id)}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            priority={index < 4}
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition-all duration-300 transform hover:scale-105">
                            <div className="text-center text-zinc-300 animate-fade-in">
                              <div className="relative">
                                <svg
                                  className="mx-auto h-16 w-16 mb-3 transform transition-transform duration-300 group-hover:scale-110"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                              </div>
                              <p className="text-sm font-mono font-bold mb-1 transform transition-all duration-300 group-hover:scale-105">
                                Click to View Image
                              </p>
                              <p className="text-xs font-mono text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
                                Loading from Drive...
                              </p>
                              <p className="text-xs font-mono text-yellow-400 mt-2 animate-pulse">
                                Attempt: {currentAttempt + 1}/{availableUrls.length}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Enhanced Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
                        
                        {/* Animated Photo Number Badge */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-black/80">
                          <p className="text-xs font-mono text-white/80 font-bold">#{index + 1}</p>
                        </div>
                        
                        {/* Scroll-animated Date Badge */}
                        <div className={`absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 
                          transform transition-all duration-500 group-hover:scale-110 group-hover:bg-black/80
                          ${visibleElements.has(animateId)
                            ? 'translate-y-0 opacity-100' 
                            : 'translate-y-4 opacity-0'
                          }`}
                          style={{
                            transitionDelay: `${(index % 4) * 150 + 300}ms`,
                          }}
                        >
                          <p className="text-xs font-mono text-white/80">
                            {photo.created_at ? formatDate(photo.created_at) : 'No date'}
                          </p>
                        </div>

                        {/* Animated Border Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500 pointer-events-none"></div>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll-animated Gallery Stats */}
            <div 
              ref={statsRef}
              data-animate-id="stats"
              className={`mt-12 text-center transition-all duration-1000 ease-out ${
                visibleElements.has('stats')
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-4 opacity-0 scale-95'
              }`}
            >
              <div className="inline-block bg-zinc-800/50 border border-zinc-600/30 rounded-lg px-4 py-2 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-zinc-800/70">
                <p className="text-sm text-zinc-300 font-mono">
                  Showing <span className="text-white font-bold animate-pulse">{photos.length}</span> photo{photos.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={closeImageModal}
        >
          {/* Close Button */}
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 group"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Download Button in Modal */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadSingleImage(selectedImage.url, `photo-${selectedImage.index + 1}.jpg`);
            }}
            className="absolute top-4 right-20 z-50 p-3 bg-white/10 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110"
            aria-label="Download image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 hover:-translate-x-1"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 hover:translate-x-1"
            aria-label="Next image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
            <p className="text-white font-mono text-sm">
              {selectedImage.index + 1} / {photos.length}
            </p>
          </div>

          {/* Main Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.url}
              alt={`Photo ${selectedImage.index + 1}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
              unoptimized={true}
              priority
            />
          </div>

          {/* Keyboard Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
            <p className="text-white/70 font-mono text-xs text-center">
              Use ← → arrows to navigate • ESC to close
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        /* Mobile-optimized scroll animations */
        @media (max-width: 768px) {
          .group:hover {
            transform: translateY(-4px) scale(1.02);
          }
          
          .group:active {
            transform: translateY(0) scale(0.98);
            transition-duration: 0.1s;
          }

          /* Faster animations on mobile for better performance */
          [data-animate-id] {
            transition-duration: 0.5s;
          }
        }

        /* Desktop enhanced scroll animations */
        @media (min-width: 769px) {
          .group:hover {
            transform: translateY(-8px) scale(1.05);
          }

          /* Parallax-like effect on desktop */
          [data-animate-id]:hover {
            transform: translateY(-2px) scale(1.02);
            transition-duration: 0.3s;
          }
        }

        /* Reduced motion accessibility */
        @media (prefers-reduced-motion: reduce) {
          .group,
          .group:hover,
          [data-animate-id] {
            transform: none !important;
            transition: opacity 0.3s ease-out !important;
          }
          
          .animate-spin,
          .animate-ping,
          .animate-pulse,
          .animate-bounce {
            animation: none;
          }
        }

        /* Enhanced performance with GPU acceleration */
        .group,
        [data-animate-id] {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
