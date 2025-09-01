'use client'

import React, { useState, useEffect } from 'react'
import UsernameSelfIntroductionUpdate from './usernameSelfIntroductionUpdate';
import AvatarUpdate from './AvatarUpdate';
import EmailAddressField from './EmailAddressField';
import ThemeSettingField from './ThemeSettingField';
import EmailNotificationSettingsField from './EmailNotificationSettingsField';
import NoteTitleUpdateField from './NoteTitleUpdateField';
import DeleteAccountField from './DeleteAccountField';
import SocialLinks from './SocialLinks';
import { fetchUserProfile } from '@/services/my-post/firebase';
import { CustomUserProfile } from '@/types/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

export default function SettingsMain() {
  const [userProfile, setUserProfile] = useState<CustomUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      
      if (user && user.email) {
        try {
          const profile = await fetchUserProfile(user.email);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto h-[100% - 80px] mt-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[100% - 80px] mt-10">
      <SettingsMainTop />
      <SettingsMainBody userProfile={userProfile} />
    </div>
  )
}

function SettingsMainTop() {
  return (
    <div className="w-full flex gap-8">
      <AvatarUpdate />
      <UsernameSelfIntroductionUpdate />
    </div>
  )
}

interface SettingsMainBodyProps {
  userProfile: CustomUserProfile | null;
}

function SettingsMainBody({ userProfile }: SettingsMainBodyProps) {
  return (
    <div className='w-full mt-16 flex flex-col gap-4'>
      {/* note page title */}
      <NoteTitleUpdateField />
      {/* Social Links */}
      <SocialLinks userProfile={userProfile} />
      {/* Email address */}
      <EmailAddressField />
      {/* Email notification */}
      <EmailNotificationSettingsField />
      {/* Theme */}
      <ThemeSettingField />
      {/* Delete account */}
      <DeleteAccountField />
    </div>
  )
}

