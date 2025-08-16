import { trendingPageModalBgColor, trendingPageSelectionColor, trendingPageTextColor, trendingPageWidgetColor } from '@/constants/color';
import { MenuItem } from '@mui/material';
import { Select } from '@mui/material';
import React from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';


interface TrendingTabbarModalProps {
  options: { label: string, value: string, path: string }[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  router: AppRouterInstance;
}

export default function TrendingTabbarModal({ options, selectedValue, setSelectedValue, router }: TrendingTabbarModalProps) {
  const menuItemStyle = {
    fontSize: 12,
    width: '160px',
    color: trendingPageTextColor,
    backgroundColor: trendingPageWidgetColor,
    '&:hover': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
    '&.Mui-selected': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
    '&.Mui-selected:hover': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
  }

  return (
    <div>
      <Select
        defaultValue={options[0].value}
        value={selectedValue}
        onChange={(e) => {
          setSelectedValue(e.target.value);
          router.push(options.find((option) => option.value === e.target.value)?.path || '/');
        }}
        sx={{
          color: trendingPageTextColor,
          backgroundColor: trendingPageModalBgColor,
          borderRadius: '16px',
          padding: '0px 8px',
          border: '1px solid #e5e7eb',
          '& .MuiSelect-select': {
            padding: '4px 8px',
          },
          '& .MuiSelect-icon': {
            color: trendingPageTextColor,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            padding: '0px',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: trendingPageWidgetColor,
              color: trendingPageTextColor,
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
