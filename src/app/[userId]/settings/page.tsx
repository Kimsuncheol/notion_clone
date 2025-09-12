'use client'
import SettingsMain from '@/components/settings/SettingsMain'
import DeleteAccountConfirmModal from '@/components/settings/DeleteAccountConfirmModal'
import { useSettingsStore } from '@/store/settingsStore'
import React, { useEffect, useState } from 'react'
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail'
import { CustomUserProfile } from '@/types/firebase'
import { fetchUserProfile } from '@/services/my-post/firebase'
import SettingsLoading from './loading'

interface SettingsPageProps {
  params: Promise<{
    userId: string;
  }>
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { userId } = React.use(params);
  const userEmail = convertToNormalUserEmail(userId);
  const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<CustomUserProfile | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchUserProfileAndSettings = async () => {
      const userProfile = await fetchUserProfile(userEmail);
      setUserProfile(userProfile);
      setIsLoading(false);
    };
    fetchUserProfileAndSettings();
    return () => {
      setIsLoading(false);
    };
  }, [userEmail]);


  return (
    <div className=''>
      {isLoading && <SettingsLoading />}
      {!isLoading && <SettingsMain userProfile={userProfile} />}
      {isDeleteAccountModalOpen && (
        <DeleteAccountConfirmModal
          onCancel={() => setIsDeleteAccountModalOpen(false)}
          onConfirm={() => setIsDeleteAccountModalOpen(false)}
        />
      )}
    </div>
  )
}