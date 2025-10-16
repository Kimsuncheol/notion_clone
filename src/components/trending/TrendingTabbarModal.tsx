'use client';

import { grayColor4, grayColor5, grayColor3, grayColor2 } from '@/constants/color';
import { MenuItem } from '@mui/material';
import { Select } from '@mui/material';
import React, { useMemo } from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
interface TrendingTabbarModalProps {
  options: { label: string, value: string, path: string }[];
  router: AppRouterInstance;
  timeframe: string | undefined;
  userEmail: string;
}

export default function TrendingTabbarModal({ options, router, timeframe, userEmail }: TrendingTabbarModalProps) {
  const menuItemStyle = {
    fontSize: 12,
    width: '160px',
    color: grayColor3,
    backgroundColor: grayColor2,
    '&:hover': {
      backgroundColor: grayColor5,
      color: grayColor3,
    },
    '&.Mui-selected': {
      backgroundColor: grayColor5,
      color: grayColor3,
    },
    '&.Mui-selected:hover': {
      backgroundColor: grayColor5,
      color: grayColor3,
    },
  }
  const selectedValue = useMemo(() => {
    if (!timeframe) {
      return options[0]?.value ?? '';
    }
    const matchedOption = options.find((option) => option.value === timeframe);
    return matchedOption?.value ?? options[0]?.value ?? '';
  }, [options, timeframe]);

  return (
    <div>
      <Select
        value={selectedValue}
        onChange={(e) => router.push(`${userEmail !== '' ? '/' + userEmail : ''}/trending/${e.target.value}`)}
        sx={{
          color: grayColor3,
          backgroundColor: grayColor4,
          borderRadius: '16px',
          padding: '0px 8px',
          border: '1px solid #e5e7eb',
          '& .MuiSelect-select': {
            padding: '4px 8px',
          },
          '& .MuiSelect-icon': {
            color: grayColor3,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            padding: '0px',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: grayColor2,
              color: grayColor3,
              padding: '4px 8px',
            },
          },
        }}
      >
        {options.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={menuItemStyle}>{option.label}</MenuItem>
        ))}
      </Select>
    </div>
  )
}
