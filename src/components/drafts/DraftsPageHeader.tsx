'use client';

import React from 'react';
import { grayColor3 } from '@/constants/color';

export default function DraftsPageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-6xl font-bold" style={{ color: grayColor3 }}>
        Drafts
      </h1>
    </div>
  );
}
