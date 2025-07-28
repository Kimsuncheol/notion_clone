import React, { useRef, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';

interface BottomMenuProps {
  setShowCalendarModal: (show: boolean) => void;
  setShowHelpContactMore: (show: boolean) => void;
  setShowInviteMembers: (show: boolean) => void;
  setShowManageMembers: (show: boolean) => void;
  onHeightChange: (height: number) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  setShowCalendarModal,
  setShowHelpContactMore,
  setShowInviteMembers,
  setShowManageMembers,
  onHeightChange,
}) => {
  const section2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (section2Ref.current) {
      const height = section2Ref.current.offsetHeight;
      console.log(`BottomMenu section 2 height: ${height}px`);
      onHeightChange(height);
    }
  }, [onHeightChange]);

  return (
    <div className='w-60 px-2 py-3 border-t border-t-gray-600 fixed bottom-0 left-0 flex flex-col gap-2 bg-black' id='bottom-section2' ref={section2Ref}>
      <div className=''>
         {/* Invite Members Section */}
      <div className="">
        <button
          onClick={() => setShowInviteMembers(true)}
          className="w-full flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <GroupAddIcon className="text-blue-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Invite
          </span>
        </button>
      </div>

      {/* Manage Members Section */}
      <div className="">
        <button
          onClick={() => setShowManageMembers(true)}
          className="w-full flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <PeopleIcon className="text-green-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Manage members
          </span>
        </button>
      </div>
      </div>
      <div className='flex items-center justify-between'>
        <div
          onClick={() => setShowCalendarModal(true)}
          className="p-[1px] rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center"
          title="Open Calendar"
        >
          <CalendarMonthIcon style={{ fontSize: '12px' }} />
        </div>
        {/* Don't touch below code */}
        <div
          id='help-contact-more-button'
          onClick={() => setShowHelpContactMore(true)}
          className='p-[1px] rounded-full border-white border-1 text-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors'>
          <QuestionMarkIcon style={{ fontSize: '12px' }} />
        </div>
      </div>
    </div>
  );
};

export default BottomMenu; 