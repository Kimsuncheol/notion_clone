import { grayColor1 } from "@/constants/color";
import { Box } from "@mui/material";
import { mintColor3 } from "@/constants/color";
import React from 'react'

export default function CustomBookmarkIcon() {
  return (
    <>
    <Box sx={{
      width: '32px',
      height: '48px',
      backgroundColor: mintColor3,
    }} />
    <Box sx={{
      width: '32px',
      height: '32px',
      borderLeft: '16px solid transparent',
      borderRight: '16px solid transparent',
      borderTop: `16px solid ${grayColor1}`,
      position: 'relative',
      top: '-32px',
      rotate: '180deg'
    }} />
  </>
  )
}