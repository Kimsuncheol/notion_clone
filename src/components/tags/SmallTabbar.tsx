import React, { useMemo } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { SmallTabbarItem } from '@/types/firebase';
import { usePathname } from 'next/navigation';

interface SmallTabbarProps {
  items: SmallTabbarItem[];
}


const SmallTabbar = React.memo(function SmallTabbar({ items }: SmallTabbarProps) {
  const pathname = usePathname();
  
  const activeTab = useMemo(() => {
    const currentPath = pathname.split('/').pop();
    return items.find(item => item.value === currentPath)?.value || items[0]?.value || '';
  }, [pathname, items]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    const targetItem = items.find(item => item.value === newValue);
    if (targetItem?.path) {
      window.location.href = targetItem.path;
    }
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: '#10b981',
            height: 2,
          },
          '& .MuiTab-root': {
            color: '#9ca3af',
            fontWeight: 500,
            fontSize: '1rem',
            px: 3,
            py: 1.5,
            transition: 'color 0.2s',
            '&:hover': {
              color: '#e5e7eb',
            },
            '&.Mui-selected': {
              color: '#ffffff',
            },
          },
        }}
      >
        {items.map((tab, index) => (
          <Tab key={index} label={tab.label} value={tab.value} href={tab.path || ''} />
        ))}
      </Tabs>
    </Box>
  );
});

export default SmallTabbar;