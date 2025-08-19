import { generalTextColor } from '@/constants/color'
import { useInboxStore } from '@/store/inboxStore'
import React from 'react'

export default function InboxPageTabbar() {
  const { activeTab, setActiveTab } = useInboxStore()
  return (
    <div className='flex flex-col'> {/* Main heading */}
      <h1 className="text-4xl font-bold mb-8" style={{ color: generalTextColor }}>
        Inbox
      </h1>

      {/* Tab navigation */}
      <div className="flex items-center mb-6">
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors duration-200 ${activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 font-medium transition-colors duration-200 ${activeTab === 'unread'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Unread
          </button>
        </div>
      </div>
    </div>
  )
}
