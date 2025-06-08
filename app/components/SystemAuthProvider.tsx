"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SystemAuthProviderProps {
  children: React.ReactNode;
}

// Giriş gerektirmeyen sayfalar (beyaz liste)
const PUBLIC_PATHS = [
  '/auth/system-login'
];

export default function SystemAuthProvider({
  children,
}: SystemAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);

  // Memoize public path check to prevent unnecessary calculations
  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.includes(pathname) || 
           PUBLIC_PATHS.some(path => pathname.startsWith(path));
  }, [pathname]);

  // Memoize auth check to prevent multiple localStorage reads
  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("systemAuth") === "true";
  }, []);

  useEffect(() => {
    // Only run auth check once during initial mount
    if (!initializedRef.current) {
      initializedRef.current = true;
      
      const authStatus = checkAuth();
      setIsAuthenticated(authStatus);

      // Handle redirects only on initial load
      if (!authStatus && !isPublicPath) {
        router.replace('/auth/system-login');
        return;
      }

      if (authStatus && pathname === '/auth/system-login') {
        router.replace('/');
        return;
      }

      setIsLoading(false);
    }
  }, []); // Empty dependency array - only run once

  // Handle pathname changes without full auth re-check
  useEffect(() => {
    if (initializedRef.current && !isLoading) {
      const authStatus = checkAuth();

      // Only redirect if auth status has actually changed
      if (authStatus !== isAuthenticated) {
        setIsAuthenticated(authStatus);
        
        if (!authStatus && !isPublicPath) {
          router.replace('/auth/system-login');
          return;
        }
        
        if (authStatus && pathname === '/auth/system-login') {
          router.replace('/');
          return;
        }
      }
    }
  }, [pathname, isPublicPath, checkAuth, isAuthenticated, isLoading]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  // Show public pages without auth check
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Show protected pages only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null if not authenticated (redirect should be in progress)
  return null;
}
