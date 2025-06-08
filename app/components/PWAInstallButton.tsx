'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const listenerAdded = useRef(false);

  // Memoize event handler to prevent re-creation
  const handleBeforeInstallPrompt = useCallback((e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
  }, []);

  useEffect(() => {
    // Only add listener once
    if (!listenerAdded.current && typeof window !== 'undefined') {
      listenerAdded.current = true;

    // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        setShowInstallButton(false);
        return;
      }

      // Check if running in development mode
      if (process.env.NODE_ENV === 'development') {
        // In development, PWA is disabled, so don't show install button
      setShowInstallButton(false);
        return;
    }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Cleanup function
      return () => {
        if (listenerAdded.current) {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
      };
    }
  }, []); // Empty dependency array - only run once

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  }, [deferredPrompt]);

  // Don't show button if already installed or in development
  if (!showInstallButton || isInstalled || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 z-50"
      style={{ cursor: 'pointer' }}
      aria-label="Install ProdTrack App"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
        />
      </svg>
      <span className="text-sm font-medium">Install App</span>
    </button>
  );
} 