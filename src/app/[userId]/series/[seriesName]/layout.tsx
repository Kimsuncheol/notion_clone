import { grayColor2 } from '@/constants/color';
import React from 'react';

export default function SeriesNameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='w-full min-h-screen' style={{ backgroundColor: grayColor2 }}>
      <div>
        {children}
      </div>
    </div>
  );
}
