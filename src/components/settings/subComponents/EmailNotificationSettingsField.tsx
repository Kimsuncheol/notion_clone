import { settingsPageCheckedSwitchColor, settingsPageMintColor, settingsPageUnchekedSwitchColor } from '@/constants/color'
import { fontSize } from '@/constants/size'
import { Switch, SxProps } from '@mui/material'
import React, { useState } from 'react'

export default function EmailNotificationSettingsField() {
  // Need to get user's notification settings from firestore
  const [commentNotification, setCommentNotification] = useState<boolean>(true);
  const [likeNotification, setLikeNotification] = useState<boolean>(true);
  const switchStyle: SxProps = {
    '& .MuiSwitch-track': {
      backgroundColor: settingsPageUnchekedSwitchColor,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: settingsPageCheckedSwitchColor,
      '&:hover': {
        backgroundColor: settingsPageCheckedSwitchColor,
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: settingsPageMintColor,
    },
  }
  return (
    <div className='flex gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='w-1/5 font-semibold' style={{ fontSize: fontSize }}>Email notification</div>
      <div className='w-4/5 flex flex-col gap-4'>
        {/* Comment notification */}
        <div className='w-1/3 flex items-center justify-between'>
          <span className='font-semibold' style={{ fontSize: fontSize }}>Comment notification</span>
          <Switch
            checked={commentNotification}
            sx={switchStyle}
            onChange={() => {
              // toggle comment notification
              setCommentNotification(!commentNotification);
            }}
          />
        </div>
        {/* Like notification */}
        <div className='w-1/3 flex items-center justify-between'>
          <span className='font-semibold' style={{ fontSize: fontSize }}>Like notification</span>
          <Switch
            checked={likeNotification}
            sx={switchStyle}
            onChange={() => {
              // toggle like notification
              setLikeNotification(!likeNotification);
            }}
          />
        </div>
      </div>
    </div>
  )
}
