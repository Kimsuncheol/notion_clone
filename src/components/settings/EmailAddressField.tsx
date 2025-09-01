import { grayColor3 } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { fontSize } from '@/constants/size'
import { Auth, getAuth, User } from 'firebase/auth';
import React from 'react'

export default function EmailAddressField() {
  const auth: Auth = getAuth(firebaseApp);
  const user: User | null = auth.currentUser;
  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full items-center gap-4'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSize }}>Email address</div>
        <div className='text-[16px] font-semibold h-full' style={{ color: grayColor3 }}>{user?.email || 'Anonymous'}</div>
      </div>
      <div className='' style={{ color: grayColor3, fontSize: fontSize }}>This is email address that you use to login to your account</div>
    </div>
  )
}
