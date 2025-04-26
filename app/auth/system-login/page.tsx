"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginLogo from "../../components/LoginLogo";

export default function SystemLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Submitting login form:", { username });
      
      // Minimal validation
      if (!username.trim() || !password) {
        setError("Username and password are required.");
        setLoading(false);
        return;
      }
      
      const response = await fetch("/api/system-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Login API response:", { status: response.status, success: data.success });

      if (response.ok && data.success) {
        // Save login state and user info to localStorage
        localStorage.setItem("systemAuth", "true");
        localStorage.setItem("username", username);

        // Save user role
        if (data.userData && data.userData.role) {
          console.log("Login successful, saving role:", data.userData.role);
          localStorage.setItem("userRole", data.userData.role);
        } else {
          console.log("Login successful but no role information:", data.userData);
        }

        // Redirect to home page
        router.push("/");
      } else {
        console.error("Login failed:", data);
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again later. Error details: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="w-full max-w-md px-8 py-10 bg-gray-800 shadow-lg rounded-lg border border-gray-700">
        <div className="flex justify-center mb-6">
          <LoginLogo />
        </div>

        <h1 className="text-xl font-semibold text-center text-white mb-6">
          System Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-md">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ cursor: "pointer" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
