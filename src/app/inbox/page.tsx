'use client'
import React from 'react';
import { 
  bgColor, 
  generalTextColor, 
} from '@/constants/color';
import InboxPageTabbar from '@/components/inbox/InboxPageTabbar';
import InboxPageMain from '@/components/inbox/InboxPageMain';

export default function InboxPage() {

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', color: generalTextColor }}>
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <InboxPageTabbar />
        {/* Notification items */}
        <InboxPageMain />
      </div>
    </div>
  );
}
