import React, { useEffect } from 'react'
import { useRef } from 'react';

interface MoreOptionsModalForSubnoteProps {
  onClose: () => void;
}

export default function MoreOptionsModalForSubnote({ onClose }: MoreOptionsModalForSubnoteProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // If users click outside the modal, close the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !modalRef.current?.contains(event.target)) {
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
      {/* blurr the background */}
      <div className='fixed inset-0 bg-black/50 z-[9999]' onClick={onClose}></div>
      <div className='p-3 z-[10000]' ref={modalRef}>MoreOptionsModalForSubnote</div>
    </>
  )
}
