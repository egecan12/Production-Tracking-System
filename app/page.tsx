"use client";

import { useState, useEffect } from "react";
import Logo from "./components/Logo";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import { hasModuleAccess } from "./lib/authUtils";

// Define modules with English text
const modules = [
  {
    id: "machines",
    href: "/machines",
    title: "Machine Management",
    description: "View your machines and manage operators",
    color: "text-blue-400",

  },
  {
    id: "employees",
    href: "/employees",
    title: "Employee Management",
    description: "Add and manage employee records",
    color: "text-green-400",
  },
  {
    id: "customers",
    href: "/customers",
    title: "Customer Management",
    description: "Add and manage customer records",
    color: "text-yellow-400",
  },
  {
    id: "wire-production",
    href: "/wire-production",
    title: "Wire Production Calculator",
    description: "Calculate and analyze wire production metrics",
    color: "text-red-400",
  },
];

export default function Home() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [accessibleModules, setAccessibleModules] = useState<typeof modules>(
    []
  );

  useEffect(() => {
    // Get user information from localStorage
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      const storedRole = localStorage.getItem("userRole");
      
      console.log("DEBUG - Stored username:", storedUsername);
      console.log("DEBUG - Stored role:", storedRole);

      if (storedUsername) {
        setUsername(storedUsername);
      }

      if (storedRole) {
        setRole(storedRole); // Role state is required for module access

        // Filter modules that the user has access to
        const filteredModules = modules.filter((module) => {
          const hasAccess = hasModuleAccess(module.id, storedRole);
          console.log(`DEBUG - Module ${module.id} access:`, hasAccess);
          return hasAccess;
        });

        console.log("DEBUG - Accessible modules:", filteredModules);
        setAccessibleModules(filteredModules);
      } else {
        console.log("DEBUG - No user role found in localStorage");
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-16 relative">
        {/* User info and Logout Button - Top Right Corner */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <div className="text-gray-300 flex items-center bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-gray-400 text-sm mr-1">User:</span> 
            <span className="text-white font-medium">{username}</span>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-8">
          <Logo />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Production Management System
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              Easily manage your machines, operators and production processes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {accessibleModules.map((module) => (
                <Link
                  key={module.id}
                  href={module.href}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 text-center border border-gray-700 hover:border-gray-600 hover:shadow-lg transform hover:-translate-y-1"
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`${module.color} flex justify-center`}>
                    {module.icon}
                  </div>
                  <h2 className={`text-xl font-semibold ${module.color} mb-2`}>
                    {module.title}
                  </h2>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </Link>
              ))}
            </div>

            {accessibleModules.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-3-2.25V4.5a2.25 2.25 0 012.25-2.25h3A2.25 2.25 0 0116.5 4.5v8.25m0 0H12m4.5 0H21a2.25 2.25 0 002.25 2.25H3a2.25 2.25 0 002.25-2.25m-13.5 0v2.25a2.25 2.25 0 002.25 2.25h6.75a2.25 2.25 0 002.25-2.25V15.75m-8.25 0V12a2.25 2.25 0 012.25-2.25h3.75A2.25 2.25 0 0115 12v3.75" />
                </svg>
                <p className="text-gray-400 text-lg">No modules available for your role</p>
                <p className="text-gray-500 text-sm mt-2">Please contact your administrator for access</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
