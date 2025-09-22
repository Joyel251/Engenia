"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import BubbleMenu from "@/components/BubbleMenu";
import LightRays from "@/components/light-rays";

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

// Multiple Google Drive URL formats to try
const getMultipleDriveUrls = (driveurl: string) => {
  if (!driveurl || typeof driveurl !== 'string') {
    return [];
  }

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /uc\?id=([a-zA-Z0-9_-]+)/
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
    return [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`,
      `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`,
      `https://drive.usercontent.google.com/download?id=${fileId}&export=view`
    ];
  }

  return [];
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
  
  const { visibleElements, observeElement } = useScrollAnimation();
  const titleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/photogallery", {
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
  }, []);

  // Setup scroll observers
  useEffect(() => {
    if (titleRef.current) {
      observeElement(titleRef.current);
    }
    if (statsRef.current) {
      observeElement(statsRef.current);
    }
  }, [loading, observeElement]);

  const handleImageError = (photoId: string, driveurl: string) => {
    console.error('Image failed to load for photo:', photoId);
    
    const availableUrls = getMultipleDriveUrls(driveurl);
    const currentAttempt = urlAttempts[photoId] || 0;
    
    if (currentAttempt < availableUrls.length - 1) {
      console.log(`Trying URL attempt ${currentAttempt + 1} for photo ${photoId}`);
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

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {/* BubbleMenu Navigation */}
      <BubbleMenu
        logo="/logo.jpg"
        items={menuItems}
        menuAriaLabel="Toggle navigation"
        menuBg="rgba(255, 255, 255, 0.95)"
        menuContentColor="#111111"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.6}
        staggerDelay={0.1}
      />

      {/* LightRays background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.2}
          lightSpread={1.1}
          rayLength={2.2}
          pulsating={true}
          fadeDistance={1.1}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.12}
          noiseAmount={0.04}
          distortion={0.08}
          glowStrength={0.7}
          glowRadius={0.22}
        />
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
          <h1 className="text-4xl md:text-6xl font-black mb-10 text-center font-mono drop-shadow-2xl">
            Photo Gallery
          </h1>
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
              <p className="text-zinc-300 text-lg font-mono">No photos available at the moment.</p>
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
                      bg-zinc-900/60 border border-white/10
                      ${visibleElements.has(animateId)
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-8 opacity-0 scale-95'
                      }`}
                    style={{
                      transitionDelay: `${(index % 4) * 150}ms`, // Stagger by row
                    }}
                  >
                    <a
                      href={photo.driveurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative w-full h-56 bg-zinc-800 overflow-hidden">
                        {currentUrl && !hasError ? (
                          <Image
                            src={currentUrl}
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
                                Opens in Google Drive
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
                    </a>
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
