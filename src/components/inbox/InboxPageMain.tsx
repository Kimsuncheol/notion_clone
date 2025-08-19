import React from 'react'
import { generalTextColor, hoveredModalItemBgColor, modalBgColor2 } from '@/constants/color'
import { Avatar } from '@mui/material'
import { Button } from '@mui/material'
import { useInboxStore } from '@/store/inboxStore'

export default function InboxPageMain() {
  const { activeTab } = useInboxStore()
  return (
    <div className="max-w-2xl">
      {/* Sample notification item */}
      <div
        className="flex items-center justify-between p-4 rounded-lg mb-4 transition-colors duration-200"
        style={{ backgroundColor: modalBgColor2 }}
      >
        <div className="flex items-center gap-4">
          <Avatar
            src="/api/placeholder/40/40"
            sx={{ width: 48, height: 48 }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium" style={{ color: generalTextColor }}>
                LeeWonjin
              </span>
              <span className="text-sm text-gray-400">
                liked your post.
              </span>
            </div>
            <div className="text-xs text-gray-500">
              March 17, 2024
            </div>
          </div>
        </div>
        <Button
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#666',
            color: generalTextColor,
            fontSize: '12px',
            minWidth: '70px',
            '&:hover': {
              backgroundColor: hoveredModalItemBgColor,
              borderColor: '#999',
            },
          }}
        >
          Following
        </Button>
      </div>

      {/* Empty state for other notifications */}
      {activeTab === 'unread' && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-2">
            No unread notifications
          </div>
          <div className="text-gray-600 text-sm">
            New notifications will be displayed here.
          </div>
        </div>
      )}
    </div>
  )
}
