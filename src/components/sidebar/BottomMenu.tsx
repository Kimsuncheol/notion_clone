import React, { useRef, useEffect } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

interface BottomMenuProps {
  setShowCalendarModal: (show: boolean) => void;
  setShowHelpContactMore: (show: boolean) => void;
  onHeightChange: (height: number) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  setShowCalendarModal,
  setShowHelpContactMore,
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
    <div className='w-60 px-4 py-2 border-t border-t-gray-600 fixed bottom-0 left-0 flex items-center justify-between bg-black' id='bottom-section2' ref={section2Ref}>
      <div
        onClick={() => setShowCalendarModal(true)}
        className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center"
        title="Open Calendar"
      >
        <CalendarMonthIcon style={{ fontSize: '12px' }} />
      </div>
      {/* Don't touch below code */}
      <div
        id='help-contact-more-button'
        onClick={() => setShowHelpContactMore(true)}
        className='p-1 rounded-full border-white border-1 text-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors'>
        <QuestionMarkIcon style={{ fontSize: '12px' }} />
      </div>
    </div>
  );
};

export default BottomMenu; 