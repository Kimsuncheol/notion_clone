import { grayColor4 } from '@/constants/color'
import React from 'react'

interface DeleteAccountConfirmModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteAccountConfirmModal({ onCancel, onConfirm }: DeleteAccountConfirmModalProps) {
  return (
    <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
      <div 
        className='w-full max-w-md p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-200 scale-100'
        style={{ backgroundColor: grayColor4 }}
      >
        {/* Header */}
        <div className='flex items-center justify-center mb-4'>
          <div className='w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center'>
            <svg className='w-6 h-6 text-red-600 dark:text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className='text-center mb-2'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Delete Account
          </h2>
        </div>

        {/* Description */}
        <div className='text-center mb-6'>
          <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
            Are you sure you want to delete your account? This action cannot be undone and you will lose all your data permanently.
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 justify-end'>
          <button 
            onClick={onCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600'
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}