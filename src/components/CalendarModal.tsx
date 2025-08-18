import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Dayjs } from 'dayjs';

interface CalendarModalProps {
  onClose: () => void;
  onDateSelect: (date: Dayjs) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, onDateSelect }) => {
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-black/50 text-white text-sm p-8 rounded-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold w-8 h-8 flex items-center justify-center"
          title="Close calendar"
        >
          ✕
        </button>

        {/* Calendar */}
        <div className="mt-4">
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            localeText={{
              calendarWeekNumberHeaderText: '#',
              calendarWeekNumberText: (weekNumber) => `${weekNumber}.`,
            }}
          >
            <DateCalendar 
              displayWeekNumber 
              onChange={handleDateChange}
              sx={{
                '& .MuiPickersCalendarHeader-root': {
                  color: 'white',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  color: 'white',
                },
                '& .MuiPickersDay-root': {
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
                '& .MuiPickersDay-today': {
                  borderColor: 'white !important',
                  border: '2px solid white !important',
                  borderRadius: '50% !important',
                  fontWeight: 'bold !important',
                },
                '& .Mui-selected': {
                  backgroundColor: '#3b82f6 !important',
                  '&:hover': {
                    backgroundColor: '#2563eb !important',
                  },
                },
                '& .MuiPickersCalendarHeader-switchViewButton': {
                  color: 'white',
                },
                '& .MuiPickersArrowSwitcher-button': {
                  color: 'white',
                },
                '& .MuiPickersCalendarHeader-label': {
                  color: 'white',
                },
                '& .MuiPickersDay-dayOutsideMonth': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal; 