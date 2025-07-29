import React from 'react'
import TabForMoreOptionsSidebar from './subComponents/TabForMoreOptionsSidebar'
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
interface MoreOptionsSidebarProps {
  selectedNoteId: string;
  onClose: () => void;
}

const tabs = [
  {
    title: 'Add to Favorites',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Copy link',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Duplicate',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Rename',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Move to',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Move to Trash',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Open in new tab',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Open in new window',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  },
  {
    title: 'Open in side peek',
    icon: [<StarIcon key='starIcon' />, <StarBorderIcon key='starBorderIcon' />],
    onClick: () => {}
  }
]

const MoreOptionsSidebar: React.FC<MoreOptionsSidebarProps> = ({ selectedNoteId }) => {
  return (
    <div className='w-60 p-2 absolute top-0 left-60 z-[9999] bg-white dark:bg-gray-800 shadow-lg border rounded-md'>
      <div className='text-sm font-semibold'>Page</div>
      {tabs.map((tab, index) => (
        <TabForMoreOptionsSidebar key={index} selectedNoteId={selectedNoteId} title={tab.title} icon={tab.icon} onClick={tab.onClick} />
      ))}
    </div>
  )
}

export default MoreOptionsSidebar;