'use client'

import React, { useEffect } from 'react'
import UsernameSelfIntroductionUpdate from './usernameSelfIntroductionUpdate';
import AvatarUpdate from './AvatarUpdate';
import EmailAddressField from './EmailAddressField';
import AppearanceSettingField from './AppearanceSettingField';
import EmailNotificationSettingsField from './EmailNotificationSettingsField';
import NoteTitleUpdateField from './NoteTitleUpdateField';
import DeleteAccountField from './DeleteAccountField';
import SocialLinks from './SocialLinks';
import { CustomUserProfile } from '@/types/firebase';

interface SettingsMainProps {
  userProfile: CustomUserProfile | null;
}

export default function SettingsMain({ userProfile }: SettingsMainProps) {
  return (
    <div className="max-w-4xl mx-auto h-[100% - 80px] mt-10">
      <SettingsMainTop userProfile={userProfile} />
      <SettingsMainBody userProfile={userProfile} />
    </div>
  )
}

interface SettingsMainTopProps {
  userProfile: CustomUserProfile | null;
}

function SettingsMainTop({ userProfile }: SettingsMainTopProps) {
  return (
    <div className="w-full flex gap-8">
      <AvatarUpdate />
      <UsernameSelfIntroductionUpdate userProfile={userProfile} />
    </div>
  )
}

interface SettingsMainBodyProps {
  userProfile: CustomUserProfile | null;
}

function SettingsMainBody({ userProfile }: SettingsMainBodyProps) {
  console.log('userProfile in SettingsMainBody', userProfile);

  useEffect(() => {
    console.log('userProfile in SettingsMainBody', userProfile);
    return () => {
      // cleanup
    }
  }, [userProfile]);

  return (
    <div className='w-full mt-16 flex flex-col gap-4'>
      {/* note page title */}
      <NoteTitleUpdateField />
      {/* Social Links */}
      <SocialLinks userProfile={userProfile} />
      {/* Email address */}
      <EmailAddressField userProfile={userProfile} />
      {/* Email notification */}
      <EmailNotificationSettingsField />
      {/* Theme */}
      <AppearanceSettingField />
      {/* Delete account */}
      <DeleteAccountField />
    </div>
  )
}

