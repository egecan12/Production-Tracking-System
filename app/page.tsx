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
          <div className="text-gray-300 flex items-center">
            <span className="text-gray-500 mr-1">User:</span> {username}
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-8">
          <Logo />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-100 mb-4">
              Production Management System
            </h1>
            <p className="text-gray-300 mb-8">
              Easily manage your machines, operators and production processes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {accessibleModules.map((module) => (
                <Link
                  key={module.id}
                  href={module.href}
                  className="bg-gray-800 shadow-md rounded-lg p-6 hover:bg-gray-700 transition-colors text-center border border-gray-700"
                >
                  <h2 className={`text-xl font-semibold ${module.color} mb-2`}>
                    {module.title}
                  </h2>
                  <p className="text-gray-300">{module.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
