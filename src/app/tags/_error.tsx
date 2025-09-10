'use client';

import React from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" id="tags-page-loading">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-red-600 mb-4">{error.message || 'Failed to load tags'}</p>
        <div className="space-x-4">
          <button 
            onClick={reset} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-gray-600">Error Details (Development)</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
