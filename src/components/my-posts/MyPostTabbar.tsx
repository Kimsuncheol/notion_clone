'use client';

import { mintColor1 } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { Tab } from '@mui/material'
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
import React from 'react'

interface MyPostTabbarProps {
  currentTab: string;
}

export default function MyPostTabbar({ currentTab }: MyPostTabbarProps) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  const tabStyle = (selectedTab: string) => {
    return {
      fontSize: '16px',
      fontWeight: 'bold',
      color: selectedTab === currentTab ? mintColor1 : 'white',
      borderBottom: selectedTab === currentTab ? `2px solid ${mintColor1}` : 'none',
    };
  };

  return (
    <div className='flex justify-center items-center gap-10'>
      <Link href={`/my-post/${user?.email}/posts`}>
        <Tab label='Posts' sx={tabStyle('posts')} />
      </Link>
      <Link href={`/my-post/${user?.email}/series`}>
        <Tab label='Series' sx={tabStyle('series')} />
      </Link>
    </div>
  )
}
