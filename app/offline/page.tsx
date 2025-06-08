'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check if we're back online
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v2m0 16v2m9-9h-2M5 12H3" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            {isOnline ? 'Back Online!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {isOnline 
              ? 'Great! Your internet connection has been restored.'
              : 'It looks like you\'re not connected to the internet. Some features may not be available.'
            }
          </p>
        </div>

        <div className="space-y-4">
          {isOnline ? (
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Return to App
            </Link>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Try Again
            </button>
          )}
          
          <div className="text-sm text-gray-400">
            <p>Connection Status: 
              <span className={`ml-1 font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">While Offline:</h3>
          <ul className="text-sm text-gray-300 space-y-1 text-left">
            <li>• Previously loaded data may still be available</li>
            <li>• New data cannot be synchronized</li>
            <li>• Some features require internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 