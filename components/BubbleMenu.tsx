"use client";
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';

type MenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  logo?: ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  hideLogo?: boolean;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: MenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

const DEFAULT_ITEMS: MenuItem[] = [
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
    href: '#',
    ariaLabel: 'Photo Gallery',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'updates',
    href: '#',
    ariaLabel: 'Updates',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  hideLogo = false,
  menuAriaLabel = 'Toggle menu',
  menuBg = '#fff',
  menuContentColor = '#111',
  useFixedPosition = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;

  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.innerWidth <= 768;
      setIsMobile(isMobileSize);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerClassName = [
    'bubble-menu',
    useFixedPosition ? 'fixed' : 'absolute',
    'top-4 md:top-8',
    'left-4 right-4 md:left-8 md:right-8',
    'flex items-center',
    hideLogo ? 'justify-end' : 'justify-between',
    'gap-2 px-0 md:gap-4',
    'pointer-events-none',
    'z-[1001]',
    'max-w-screen-xl mx-auto',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out'
            },
            '-=' + animationDuration * 0.9
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in'
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        }
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      {/* Workaround for silly Tailwind capabilities */}
      <style>{`
        .bubble-menu {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .bubble-menu {
            left: 16px !important;
            right: 16px !important;
            top: max(16px, env(safe-area-inset-top)) !important;
            width: calc(100vw - 32px) !important;
            max-width: calc(100vw - 32px) !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .bubble-menu .bubble {
            flex-shrink: 0;
          }
        }
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items {
            padding: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh;
            min-height: 100svh;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          .bubble-menu-items .pill-list {
            row-gap: 16px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 auto !important;
            margin-left: 0 !important;
            overflow: visible;
            width: 100%;
            max-width: 300px;
            display: flex;
            justify-content: center;
          }
          .bubble-menu-items .pill-link {
            font-size: 1.25rem;
            padding: 1rem 2rem;
            min-height: 60px !important;
            border-radius: 15px;
            width: 100%;
            text-align: center;
            background: white;
            color: black;
            border: none;
            backdrop-filter: none;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .bubble-menu-items .pill-link:hover {
            transform: scale(1.05);
            background: var(--hover-bg, #f3f4f6);
            color: var(--hover-color, black);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(0.98);
          }
        }
      `}</style>

      <nav className={containerClassName} style={style} aria-label="Main navigation">
        {!hideLogo && <div
          className={[
            'bubble logo-bubble',
            'inline-flex items-center justify-center',
            'pointer-events-auto',
            'h-10 w-10 md:h-16 md:w-16 lg:h-20 lg:w-20',
            'will-change-transform',
            'bg-white/10 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none',
            'rounded-full border border-white/20 md:border-none',
            'shadow-lg md:shadow-none',
            'flex-shrink-0'
          ].join(' ')}
          aria-label="Logo"
          style={{
            minHeight: '40px',
            minWidth: '40px'
          }}
        >
          <span
            className={['logo-content', 'inline-flex items-center justify-center', 'w-full h-full'].join(' ')}
            style={
              {
                ['--logo-max-height']: '100%',
                ['--logo-max-width']: '100%'
              } as CSSProperties
            }
          >
            {typeof logo === 'string' ? (
              <img src={logo} alt="Logo" className="bubble-logo w-full h-full object-cover rounded-full shadow-lg" />
            ) : (
              logo
            )}
          </span>
  </div>}

        <button
          type="button"
          className={[
            'bubble toggle-bubble menu-btn',
            isMenuOpen ? 'open' : '',
            'inline-flex flex-col items-center justify-center',
            'rounded-full',
            'bg-white/95 backdrop-blur-sm',
            'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
            'pointer-events-auto',
            'w-10 h-10 md:w-14 md:h-14',
            'border-0 cursor-pointer p-0',
            'will-change-transform',
            'hover:scale-105 active:scale-95 transition-transform duration-200',
            'border border-white/20 md:border-none',
            'flex-shrink-0'
          ].join(' ')}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ 
            background: `${menuBg}f0`,
            minHeight: '40px',
            minWidth: '40px'
          }}
        >
          <span
            className="menu-line block mx-auto rounded-[2px]"
            style={{
              width: isMobile ? 18 : 26,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen ? 'translateY(2.5px) rotate(45deg)' : 'none'
            }}
          />
          <span
            className="menu-line short block mx-auto rounded-[2px]"
            style={{
              marginTop: isMobile ? '4px' : '6px',
              width: isMobile ? 18 : 26,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen ? 'translateY(-2.5px) rotate(-45deg)' : 'none'
            }}
          />
        </button>
      </nav>

      {showOverlay && (
        <div
          ref={overlayRef}
          className={[
            'bubble-menu-items',
            useFixedPosition ? 'fixed' : 'absolute',
            'inset-0',
            'flex items-center justify-center',
            'pointer-events-none',
            'z-[1000]'
          ].join(' ')}
          aria-hidden={!isMenuOpen}
          onClick={(e) => {
            // Close menu when clicking on overlay (mobile)
            if (e.target === e.currentTarget && isMobile) {
              handleToggle();
            }
          }}
          style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
        >
          <ul
            className={[
              'pill-list',
              'list-none m-0 px-6',
              'w-full max-w-[1600px] mx-auto',
              'flex flex-wrap',
              'gap-x-0 gap-y-1',
              'pointer-events-auto'
            ].join(' ')}
            role="menu"
            aria-label="Menu links"
          >
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                role="none"
                className={[
                  'pill-col',
                  'flex justify-center items-stretch',
                  '[flex:0_0_calc(100%/3)]',
                  'box-border'
                ].join(' ')}
              >
                <Link
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className={[
                    'pill-link',
                    'w-full',
                    'rounded-[999px]',
                    'no-underline',
                    'bg-white',
                    'text-inherit',
                    'shadow-[0_4px_14px_rgba(0,0,0,0.10)]',
                    'flex items-center justify-center',
                    'relative',
                    'transition-[background,color] duration-300 ease-in-out',
                    'box-border',
                    'whitespace-nowrap overflow-hidden'
                  ].join(' ')}
                  style={
                    {
                      ['--item-rot']: `${item.rotation ?? 0}deg`,
                      ['--pill-bg']: isMobile ? 'white' : menuBg,
                      ['--pill-color']: isMobile ? 'black' : menuContentColor,
                      ['--hover-bg']: item.hoverStyles?.bgColor || (isMobile ? '#f3f4f6' : '#f3f4f6'),
                      ['--hover-color']: item.hoverStyles?.textColor || (isMobile ? 'black' : menuContentColor),
                      background: isMobile ? 'white' : 'var(--pill-bg)',
                      color: isMobile ? 'black' : 'var(--pill-color)',
                      border: isMobile ? 'none' : 'none',
                      backdropFilter: isMobile ? 'none' : 'none',
                      boxShadow: isMobile ? '0 4px 16px rgba(0, 0, 0, 0.15)' : 'none',
                      borderRadius: isMobile ? '15px' : 'var(--pill-radius, 999px)',
                      minHeight: 'var(--pill-min-h, 160px)',
                      padding: 'clamp(1.5rem, 3vw, 8rem) 0',
                      fontSize: 'clamp(1.5rem, 4vw, 4rem)',
                      fontWeight: 700,
                      fontFamily: "'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif",
                      letterSpacing: '0.02em',
                      lineHeight: 0,
                      willChange: 'transform',
                      height: 10
                    } as CSSProperties
                  }
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el as unknown as HTMLAnchorElement;
                  }}
                  onClick={() => {
                    // Close after navigation
                    if (isMenuOpen) {
                      setIsMenuOpen(false);
                      // overlay hide animation mimic
                      setTimeout(() => setShowOverlay(false), 250);
                    }
                  }}
                >
                  <span
                    className="pill-label inline-block font-bold"
                    style={{
                      willChange: 'transform, opacity',
                      height: '1.2em',
                      lineHeight: 1.2,
                      fontFamily: "'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif",
                      letterSpacing: '0.025em',
                      textTransform: 'capitalize'
                    }}
                    ref={el => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}