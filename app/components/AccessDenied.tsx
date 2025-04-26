"use client";

import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-8 max-w-md text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-16 h-16 text-red-500 mx-auto mb-4"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
            clipRule="evenodd"
          />
        </svg>

        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>

        <p className="text-gray-300 mb-6">
          You don't have the necessary permissions to view this page. Please contact the system administrator.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
        >
          Home Page
        </Link>
      </div>
    </div>
  );
}
