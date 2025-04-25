"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "../lib/translations";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // API'ye logout isteği gönder
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear all authentication data from localStorage
      if (typeof window !== "undefined") {
        // Sistem auth token'ı
        localStorage.removeItem("systemAuth");
        
        // Diğer kullanıcı bilgileri
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        
        console.log("Logged out, all auth tokens cleared");
      }
      
      // Sistem giriş sayfasına yönlendir
      router.push("/auth/system-login");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Hata olsa bile her durumda token'ları temizle ve giriş sayfasına yönlendir
      localStorage.removeItem("systemAuth");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      
      router.push("/auth/system-login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ cursor: "pointer" }}
    >
      {isLoggingOut ? t("Çıkış yapılıyor...") : t("Çıkış")}
    </button>
  );
}
