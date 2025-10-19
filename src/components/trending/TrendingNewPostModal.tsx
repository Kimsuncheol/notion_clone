'use client';

import React from 'react';

interface TrendingNewPostModalProps {
  onClose: () => void;
  onCreateMarkdown: () => void;
  onCreateHandwriting: () => void;
}

export default function TrendingNewPostModal({
  onClose,
  onCreateMarkdown,
  onCreateHandwriting,
}: TrendingNewPostModalProps) {
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create a new post</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose the type of note you want to start.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onCreateMarkdown}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-700"
          >
            Start Markdown Note
          </button>
          <button
            type="button"
            onClick={onCreateHandwriting}
            className="w-full rounded-xl border border-blue-500 bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Start Handwriting Note
          </button>
        </div>
      </div>
    </div>
  );
}
