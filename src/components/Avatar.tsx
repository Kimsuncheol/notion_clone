import React from 'react'

export default function Avatar({ name, size = 32 }: { name: string, size?: number }) {
  return (
    <div className='rounded-full bg-gray-200 flex items-center justify-center aspect-square box-content p-1' style={{ width: size, height: size }}>
      <p className='text-sm font-bold text-black'>{name.charAt(0)}</p>
    </div>
  )
}
