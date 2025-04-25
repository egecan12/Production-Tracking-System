"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Tarayıcı tarafında çalıştırılacak
    if (typeof window !== "undefined") {
      // Token kontrolü (systemAuth)
      const authStatus = localStorage.getItem("systemAuth") === "true";
      setIsAuthenticated(authStatus);

      // Şu anki sayfa giriş gerektirmeyen bir sayfa mı kontrol et
      const isPublicPath = PUBLIC_PATHS.includes(pathname) || 
                         PUBLIC_PATHS.some(path => pathname.startsWith(path));

      // Eğer token yoksa ve korumalı bir sayfaya erişmeye çalışıyorsa giriş sayfasına yönlendir
      if (!authStatus && !isPublicPath) {
        console.log("Auth required, redirecting to login page");
        router.push('/auth/system-login');
      }

      // Eğer token varsa ve giriş sayfasındaysa ana sayfaya yönlendir
      if (authStatus && pathname === '/auth/system-login') {
        console.log("Already authenticated, redirecting to homepage");
        router.push('/');
      }

      setIsLoading(false);
    }
  }, [pathname, router]);

  // Yükleme esnasında bir gösterge göster (opsiyonel)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  // Auth gerektirmeyen sayfa ise (giriş sayfası gibi) direkt içeriği göster
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  // Auth gerektiren sayfalar için, token varsa içeriği göster
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Bu noktaya gelindiyse, muhtemelen giriş sayfasına yönlendirme yapılıyor
  return null;
}
