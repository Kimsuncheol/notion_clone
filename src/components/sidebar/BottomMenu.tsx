import React, { useRef, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';
import { grayColor2 } from '@/constants/color';
import { useModalStore } from '@/store/modalStore';

interface BottomMenuProps {
  onHeightChange: (height: number) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  onHeightChange,
}) => {
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const {
    showInviteMembers,
    showManageMembers,
    showCalendarModal,
    showHelpContactMore,
    setShowInviteMembers,
    setShowManageMembers,
    setShowCalendarModal,
    setShowHelpContactMore
  } = useModalStore();

  useEffect(() => {
    if (section2Ref.current) {
      const height = section2Ref.current.offsetHeight;
      // console.log(`BottomMenu section 2 height: ${height}px`);
      onHeightChange(height);
    }
  }, [onHeightChange]);

  return (
    <div className='w-60 px-2 py-3 border-t border-r border-r-white/15 border-t-gray-600 fixed bottom-0 left-0 flex flex-col gap-1' id='bottom-section2' ref={section2Ref} style={{ backgroundColor: grayColor2 }}>
      <div className='flex flex-col gap-1'>
        {/* Invite Members Section */}
        <div
          onClick={() => setShowInviteMembers(!showInviteMembers)}
          id="invite-members-toggle"
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <GroupAddIcon className="text-blue-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Invite
          </span>
        </div>

        {/* Manage Members Section */}
        <div
          onClick={() => setShowManageMembers(!showManageMembers)}
          id="manage-members-toggle"
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <PeopleIcon className="text-green-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Manage members
          </span>
        </div>
      </div>
      <div className='flex items-center justify-between mt-2'>
        <div
          onClick={() => setShowCalendarModal(!showCalendarModal)}
          id="calendar-toggle"
          className="p-[1px] rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center"
          title="Open Calendar"
        >
          <CalendarMonthIcon style={{ fontSize: '12px' }} />
        </div>
        {/* Don't touch below code */}
        <div
          id='help-contact-more-toggle'
          // id='help-contact-more-button'
          onClick={() => setShowHelpContactMore(!showHelpContactMore)}
          className='p-[1px] rounded-full border-white border-1 text-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors'>
          <QuestionMarkIcon style={{ fontSize: '12px' }} />
        </div>
      </div>
    </div>
  );
};

export default BottomMenu; 