import { mintColor1, grayColor7 } from '@/constants/color'
import { fontSize } from '@/constants/size'
import { Switch, SxProps } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { fetchUserSettings, updateUserEmailNotification } from '@/services/settings/firebase'
import { EmailNotification } from '@/types/firebase'
import { sendCommentEmailNotification, sendLikeEmailNotification } from '@/services/notifications/emailNotifications'

export default function EmailNotificationSettingsField() {
  const [commentNotification, setCommentNotification] = useState<boolean>(true);
  const [likeNotification, setLikeNotification] = useState<boolean>(true);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.emailNotification) {
          setCommentNotification(settings.emailNotification.commentNotification);
          setLikeNotification(settings.emailNotification.likeNotification);
        }
      } catch (error) {
        console.error('Error loading email notification settings:', error);
      }
    };

    loadUserSettings();
  }, []);

  const updateNotificationSetting = async (notificationType: 'comment' | 'like', value: boolean) => {
    try {
      const emailNotification: EmailNotification = {
        commentNotification: notificationType === 'comment' ? value : commentNotification,
        likeNotification: notificationType === 'like' ? value : likeNotification
      };
      await updateUserEmailNotification(emailNotification);
      if (notificationType === 'comment' && value) {
        await sendCommentEmailNotification();
      }
      if (notificationType === 'like' && value) {
        await sendLikeEmailNotification();
      }
    } catch (error) {
      console.error('Error updating email notification:', error);
    }
  };
  const switchStyle: SxProps = {
    '& .MuiSwitch-track': {
      backgroundColor: grayColor7,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: mintColor1,
      '&:hover': {
        backgroundColor: mintColor1,
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: mintColor1,
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
              const newValue = !commentNotification;
              setCommentNotification(newValue);
              updateNotificationSetting('comment', newValue);
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
              const newValue = !likeNotification;
              setLikeNotification(newValue);
              updateNotificationSetting('like', newValue);
            }}
          />
        </div>
      </div>
    </div>
  )
}
