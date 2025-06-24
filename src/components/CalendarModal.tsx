'use client';
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import CloseIcon from '@mui/icons-material/Close';

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="calendar-modal-content bg-black border border-gray-700 rounded-lg p-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
          title="Close Calendar"
        >
          <CloseIcon fontSize="small" />
        </button>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar 
            sx={{
              backgroundColor: 'black',
              '& .MuiPickersDay-root': {
                color: 'white',
              },
              '& .MuiTypography-root': {
                color: 'white',
              },
              '& .MuiIconButton-root': {
                color: 'white',
              },
              // Style today's date to be dark blue
              '& .MuiPickersDay-today': {
                backgroundColor: '#1e3a8a !important', // dark blue
                color: 'white !important',
                border: '1px solid #3b82f6 !important',
                '&:hover': {
                  backgroundColor: '#1e40af !important', // slightly darker blue on hover
                },
              },
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};

export default CalendarModal; 