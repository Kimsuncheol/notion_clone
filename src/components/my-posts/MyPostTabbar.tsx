import { settingsPageMintColor } from '@/constants/color';
import { useMyPostStore } from '@/store/myPostStore';
import { Tab } from '@mui/material'
import React from 'react'

export default function MyPostTabbar() {
  const { tab, setTab } = useMyPostStore();
  const tabStyle = (selectedTab: string) => {
    return {
      fontSize: '16px',
      fontWeight: 'bold',
      color: selectedTab === tab ? settingsPageMintColor : 'white',
      borderBottom: selectedTab === tab ? `2px solid ${settingsPageMintColor}` : 'none',
    };
  };
  return (
    <div className='flex justify-center items-center gap-10'>
      <Tab label='Posts' sx={tabStyle('posts')} onClick={() => setTab('posts')} />
      <Tab label='Series' sx={tabStyle('series')} onClick={() => setTab('series')} />
    </div>
  )
}
