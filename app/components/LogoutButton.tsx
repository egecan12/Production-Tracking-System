"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Send logout request to API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear all authentication data from localStorage
      if (typeof window !== "undefined") {
        // System auth token
        localStorage.removeItem("systemAuth");
        
        // Other user information
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        
        console.log("Logged out, all auth tokens cleared");
      }
      
      // Redirect to system login page
      router.push("/auth/system-login");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Clear tokens and redirect to login page even if there's an error
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
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
