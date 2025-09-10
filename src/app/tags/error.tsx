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
        <p className="text-red-600 mb-4">{error.message || 'Failed to load tags'}</p>
        <button 
          onClick={reset} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}