'use client'
import SettingsMain from '@/components/settings/SettingsMain'
import DeleteAccountConfirmModal from '@/components/settings/subComponents/DeleteAccountConfirmModal'
import TrendingHeader from '@/components/trending/TrendingHeader'
import { trendingPageBgColor } from '@/constants/color'
import { useSettingsStore } from '@/store/settingsStore'
import React from 'react'

export default function SettingsPage() {
  const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()

  return (
    <div className='w-full min-h-screen relative' style={{ backgroundColor: trendingPageBgColor }}>
      <div className='w-[80%] mx-auto min-h-screen' >
        <TrendingHeader />
        <SettingsMain />
      </div>
      { isDeleteAccountModalOpen && <DeleteAccountConfirmModal onCancel={() => setIsDeleteAccountModalOpen(false)} onConfirm={() => setIsDeleteAccountModalOpen(false)} /> }
    </div>
  )
}
