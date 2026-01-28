'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the Swagger spec from API
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load API documentation');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 text-white py-6 px-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Kitchen of Tech API Documentation</h1>
          <p className="text-gray-300 mt-2">
            Comprehensive REST API documentation for developers
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Getting Started</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  To use the API, you'll need to:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Obtain a JWT token from the <code>/api/auth/login</code> endpoint</li>
                  <li>Include the token in the Authorization header: <code>Bearer &lt;token&gt;</code></li>
                  <li>For mutations, include a CSRF token in the <code>x-csrf-token</code> header</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {spec && <SwaggerUI spec={spec} />}
      </main>

      <footer className="bg-gray-900 text-white py-4 px-4 mt-8">
        <div className="container mx-auto max-w-7xl text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Kitchen of Tech. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
