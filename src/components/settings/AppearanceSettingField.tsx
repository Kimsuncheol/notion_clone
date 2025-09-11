import { fontSize } from '@/constants/size'
import React, { useState, useEffect } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import { mintColor1 } from '@/constants/color';
import { fetchUserSettings, updateUserAppearance } from '@/services/settings/firebase';
import { Appearance } from '@/types/firebase';

export default function AppearanceSettingField() {
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.appearance) {
          setAppearance(settings.appearance.appearance);
        }
      } catch (error) {
        console.error('Error loading appearance settings:', error);
      }
    };

    loadUserSettings();
  }, []);

  const handleAppearanceChange = async (newAppearance: 'light' | 'dark' | 'system') => {
    try {
      const appearanceData: Appearance = { appearance: newAppearance };
      await updateUserAppearance(appearanceData);
      setAppearance(newAppearance);
    } catch (error) {
      console.error('Error updating appearance:', error);
    }
  };

  return (
    <div className='flex gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='w-1/5 font-semibold' style={{ fontSize: fontSize }}>Appearance</div>
      <div className='w-2/5 flex gap-4 items-center'>
        <AppearanceSettingFieldItem
          appearance='light'
          icon={[
            <WbSunnyOutlinedIcon
              sx={{ fontSize: 30, color: 'black' }}
              key='light-icon-1' />
          ]}
          isChecked={appearance === 'light'}
          onClick={() => { handleAppearanceChange('light') }} />
        <AppearanceSettingFieldItem
          appearance='dark'
          icon={[
            <BedtimeOutlinedIcon
              sx={{ fontSize: 30, color: 'white' }}
              key='dark-icon-1' />
          ]}
          isChecked={appearance === 'dark'}
          onClick={() => { handleAppearanceChange('dark') }} />
        <AppearanceSettingFieldItem
          appearance='system'
          icon={[
            <WbSunnyOutlinedIcon
              sx={{ fontSize: 30, color: 'black' }}
              key='system-icon-1' />,
            <BedtimeOutlinedIcon
              sx={{ fontSize: 30, color: 'white' }}
              key='system-icon-2' />
          ]}
          isChecked={appearance === 'system'}
          onClick={() => { handleAppearanceChange('system') }} />
      </div>
    </div>
  )
}

function AppearanceSettingFieldItem({ appearance, icon, isChecked, onClick }: { appearance: string, icon: React.ReactNode[], isChecked: boolean, onClick: () => void }) {
  return (
    <div className={`w-1/3 aspect-square`}>
      {
        appearance === 'light' ? (
          <div className='w-full aspect-3/2 bg-white flex items-center justify-center rounded-md'
            style={{ border: isChecked ? `2px solid ${mintColor1}` : `none` }}
            onClick={onClick}
          >
            {icon[0]}
          </div>
        ) : appearance === 'dark' ? (
          <div className='w-full aspect-3/2 bg-black flex items-center justify-center rounded-md'
            style={{ border: isChecked ? `2px solid ${mintColor1}` : `none` }}
            onClick={onClick}
          >
            {icon[0]}
          </div>
        ) : (
          <div className='w-full aspect-3/2 flex justify-center items-center rounded-md overflow-hidden'
            style={{ border: isChecked ? `2px solid ${mintColor1}` : `none` }}
            onClick={onClick}
          >
            <div className={`w-1/2 h-full aspect-square bg-white flex items-center justify-center`}>
              {icon[0]}
            </div>
            <div className={`w-1/2 h-full aspect-square bg-black flex items-center justify-center`}>
              {icon[1]}
            </div>
          </div>
        )
      }
    </div>
  )
}
