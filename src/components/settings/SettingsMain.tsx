'use client'
import React from 'react'
import UsernameSelfIntroductionUpdate from './subComponents/usernameSelfIntroductionUpdate';
import AvatarUpdate from './subComponents/AvatarUpdate';
import EmailAddressField from './subComponents/EmailAddressField';
import ThemeSettingField from './subComponents/ThemeSettingField';
import EmailNotificationSettingsField from './subComponents/EmailNotificationSettingsField';
import NoteTitleUpdateField from './subComponents/NoteTitleUpdateField';
import DeleteAccountField from './subComponents/DeleteAccountField';

export default function SettingsMain() {
  return (
    <div className="max-w-4xl mx-auto h-[100% - 80px] mt-10">
      <SettingsMainTop />
      <SettingsMainBody />
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

function SettingsMainBody() {

  return (
    <div className='w-full mt-16 flex flex-col gap-4'>
      {/* note page title */}
      <NoteTitleUpdateField />
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

