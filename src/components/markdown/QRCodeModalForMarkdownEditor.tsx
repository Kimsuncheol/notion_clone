import { grayColor2 } from '@/constants/color';
import React, { useEffect } from 'react'
import QRCode from 'react-qr-code'
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

interface QRCodeModalForMarkdownEditorProps {
  onClose: () => void;
}

export default function QRCodeModalForMarkdownEditor({ onClose }: QRCodeModalForMarkdownEditorProps) {
  const noteUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement && !event.target.closest('.modal-content')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}></div>
      <div className="modal-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 shadow-xl" style={{ backgroundColor: grayColor2 }}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-white">QR Code</h2>
          <IconButton 
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                color: 'gray',
              },
              padding: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <p className="text-white mb-4">Scan the QR code to view the note</p>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCode
            value={noteUrl}
            size={400}
            style={{ height: "400px", width: "400px" }}
          />
        </div>
      </div>
    </>
  )
}
