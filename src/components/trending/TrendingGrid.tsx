import React from 'react';
import TrendingCard from './TrendingCard';
import { TrendingItem } from '@/types/firebase';

interface TrendingGridProps {
  items: TrendingItem[];
}

const TrendingGrid = React.memo(({ items }: TrendingGridProps) => {
  return (
    <div className="px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <TrendingCard
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
    </div>
  );
});

TrendingGrid.displayName = 'TrendingGrid';

export default TrendingGrid;
