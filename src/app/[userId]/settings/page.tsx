'use client'
import SettingsMain from '@/components/settings/SettingsMain'
import DeleteAccountConfirmModal from '@/components/settings/DeleteAccountConfirmModal'
import { useSettingsStore } from '@/store/settingsStore'
import React from 'react'

export default function SettingsPage() {
  const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()

  return (
    <div className=''>
      <SettingsMain />
      {isDeleteAccountModalOpen && (
        <DeleteAccountConfirmModal 
          onCancel={() => setIsDeleteAccountModalOpen(false)} 
          onConfirm={() => setIsDeleteAccountModalOpen(false)} 
        />
      )}
    </div>
  )
}