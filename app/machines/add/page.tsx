"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasMachinePermission } from "../../lib/authUtils";
import AccessDenied from "../../components/AccessDenied";

export default function AddMachinePage() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [machineName, setMachineName] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "maintenance">(
    "active"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const canAdd = hasMachinePermission("add");
    setHasAccess(canAdd);
  }, []);

  // Access control
  if (hasAccess === false) {
    return <AccessDenied />;
  }

  // Access check is performed while the page is loading
  if (hasAccess === null) {
    return (
      <div className="text-center py-8 text-gray-300 bg-gray-900 min-h-screen">
        Loading...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineName) {
      setMessage("Please enter a machine name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Add new machine to Supabase - ID will be generated automatically
      const { error } = await supabase
        .from("machines")
        .insert([
          {
            name: machineName,
            model: model || null,
            location: location || null,
            number: number || null,
            status,
          },
        ])
        .select();

      if (error) throw error;

      setMessage("Machine added successfully!");
      // Redirect to machine list
      setTimeout(() => {
        router.push("/machines");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <Link
          href="/machines"
          className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded inline-flex items-center"
        >
          <span>&#8592;</span>
          <span className="ml-2">Return to Machines</span>
        </Link>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg p-6 max-w-2xl mx-auto border border-gray-700">
        <div className="flex items-center mb-6">
          <div className="mr-4 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-10 h-10 text-blue-500"
            >
              <rect x="5" y="50" width="54" height="4" rx="1" />
              <circle cx="20" cy="40" r="10" />
              <circle cx="20" cy="40" r="3" fill="currentColor" opacity="0.2" />
              <line x1="20" y1="40" x2="48" y2="24" />
              <circle cx="48" cy="24" r="3" />
              <rect x="45" y="20" width="10" height="20" rx="1" />
              <circle cx="48" cy="24" r="1.5" fill="currentColor" />
              <circle cx="48" cy="28" r="1.5" fill="currentColor" />
              <circle cx="48" cy="32" r="1.5" fill="currentColor" />
              <circle cx="52" cy="24" r="1.5" fill="currentColor" />
              <circle cx="52" cy="28" r="1.5" fill="currentColor" />
              <circle cx="52" cy="32" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Add New Machine</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="machineName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Machine Name
            </label>
            <input
              id="machineName"
              type="text"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter machine name"
            />
          </div>

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Machine Type / Model
            </label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Machine type/model (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="number"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Number
            </label>
            <input
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Machine number (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Machine location (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "active" | "inactive" | "maintenance"
                )
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Machine
                </>
              )}
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 rounded-md bg-gray-700 text-center">
              <span
                className={
                  message.startsWith("Error")
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                {message}
              </span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
