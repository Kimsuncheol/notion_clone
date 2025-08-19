import { fontSize } from '@/constants/size'
import { useSettingsStore } from '@/store/settingsStore'
import React from 'react'

export default function DeleteAccountField() {
  const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()

  const handleDeleteAccount = async () => {
    setIsDeleteAccountModalOpen(true)
  }

  return (
    <div className='flex flex-col gap-4 w-full pb-4'>
      <div className='flex items-center gap-4'>
        <div className='w-1/5 font-semibold' style={{ fontSize: fontSize }}>Delete account</div>
        <div className='w-2/5 flex gap-4 items-center' onClick={handleDeleteAccount}>
          <div className='bg-red-500 font-semibold w-1/2 p-2 rounded-md text-center'>Delete account</div>
        </div>
      </div>
      <div className='text-sm text-gray-500'>If you delete your account, all your data will be deleted and you will not be able to recover it.</div>
    </div>
  )
}
