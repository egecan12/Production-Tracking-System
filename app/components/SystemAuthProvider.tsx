"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SystemAuthProviderProps {
  children: React.ReactNode;
}

export default function SystemAuthProvider({
  children,
}: SystemAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // LocalStorage'a tarayıcı tarafında erişim sağla
    if (typeof window !== "undefined") {
      // Eğer sayfanın yeniden yüklenmesi durumunda giriş durumunu localStorage'dan kontrol et
      const authStatus = localStorage.getItem("systemAuth") === "true";
      setIsAuthenticated(authStatus);

      // Eğer giriş yapmamışsa ve giriş sayfasında değilse, giriş sayfasına yönlendir
      if (!authStatus && pathname !== "/auth/system-login") {
        // setTimeout kullanarak React render döngüsünün dışında çalıştırıyoruz
        setTimeout(() => {
          router.push("/auth/system-login");
        }, 0);
      }

      // Eğer kullanıcı giriş sayfasındaysa ve zaten giriş yapmışsa, ana sayfaya yönlendir
      if (authStatus && pathname === "/auth/system-login") {
        // setTimeout kullanarak React render döngüsünün dışında çalıştırıyoruz
        setTimeout(() => {
          router.push("/");
        }, 0);
      }
    }
  }, [pathname, router]);

  // İlk yüklemede henüz localStorage kontrolü yapılmamışsa, içeriği gösterme
  if (isAuthenticated === null) {
    return null;
  }

  // Eğer kullanıcı giriş sayfasındaysa ve giriş yapmamışsa, giriş sayfasını göster
  if (!isAuthenticated && pathname === "/auth/system-login") {
    return <>{children}</>;
  }

  // Eğer kullanıcı giriş yapmışsa, normal içeriği göster
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Diğer durumlarda (giriş yapmamış ve giriş sayfasında değil), içeriği gösterme
  return null;
}
