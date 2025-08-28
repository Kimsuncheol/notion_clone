import { fontSize } from '@/constants/size'
import React, { useState } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import { mintColor1 } from '@/constants/color';

export default function ThemeSettingField() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  return (
    <div className='flex gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='w-1/5 font-semibold' style={{ fontSize: fontSize }}>Theme</div>
      <div className='w-2/5 flex gap-4 items-center'>
        <ThemeSettingFieldItem theme='light' icon={[<WbSunnyOutlinedIcon sx={{ fontSize: 30, color: 'black' }} key='light-icon-1' />]} isChecked={theme === 'light'} onClick={() => { setTheme('light') }} />
        <ThemeSettingFieldItem theme='dark' icon={[<BedtimeOutlinedIcon sx={{ fontSize: 30, color: 'white' }} key='dark-icon-1' />]} isChecked={theme === 'dark'} onClick={() => { setTheme('dark') }} />
        <ThemeSettingFieldItem theme='system' icon={[<WbSunnyOutlinedIcon sx={{ fontSize: 30, color: 'black' }} key='system-icon-1' />, <BedtimeOutlinedIcon sx={{ fontSize: 30, color: 'white' }} key='system-icon-2' />]} isChecked={theme === 'system'} onClick={() => { setTheme('system') }} />
      </div>
    </div>
  )
}

function ThemeSettingFieldItem({ theme, icon, isChecked, onClick }: { theme: string, icon: React.ReactNode[], isChecked: boolean, onClick: () => void }) {
  return (
    <div className={`w-1/3 aspect-square`}>
      {
        theme === 'light' ? (
          <div className='w-full aspect-3/2 bg-white flex items-center justify-center rounded-md'
            style={{ border: isChecked ? `2px solid ${mintColor1}` : `none` }}
            onClick={onClick}
          >
            {icon[0]}
          </div>
        ) : theme === 'dark' ? (
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
