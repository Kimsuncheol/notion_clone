'use client'
import SettingsMain from '@/components/settings/SettingsMain'
import DeleteAccountConfirmModal from '@/components/settings/DeleteAccountConfirmModal'
import { useSettingsStore } from '@/store/settingsStore'
import React from 'react'

export default function SettingsPage() {
  const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()

  return (
    <>
      <SettingsMain />
      {isDeleteAccountModalOpen && (
        <DeleteAccountConfirmModal 
          onCancel={() => setIsDeleteAccountModalOpen(false)} 
          onConfirm={() => setIsDeleteAccountModalOpen(false)} 
        />
      )}
    </>
  )
}
// 'use client'
// import SettingsMain from '@/components/settings/SettingsMain'
// import DeleteAccountConfirmModal from '@/components/settings/DeleteAccountConfirmModal'
// import { grayColor2 } from '@/constants/color'
// import { useSettingsStore } from '@/store/settingsStore'
// import React from 'react'

// export default function SettingsPage() {
//   const { isDeleteAccountModalOpen, setIsDeleteAccountModalOpen } = useSettingsStore()

//   return (
//     <div className='w-full min-h-screen relative' style={{ backgroundColor: grayColor2 }}>
//       <div className='w-[80%] mx-auto min-h-screen' >
//       <SettingsMain />
//       </div>
//       { isDeleteAccountModalOpen && <DeleteAccountConfirmModal onCancel={() => setIsDeleteAccountModalOpen(false)} onConfirm={() => setIsDeleteAccountModalOpen(false)} /> }
//     </div>
//   )
// }
