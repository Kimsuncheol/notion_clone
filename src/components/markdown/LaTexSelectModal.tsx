import React, { useEffect } from 'react'
import { List, ListItem, Typography, Divider } from '@mui/material'
import { grayColor4, grayColor5 } from '@/constants/color';
import { LatexStructure } from '../markdown/interface';
import { latexStructures } from '../markdown/constants';

interface LaTexSelectModalProps {
  onClose: () => void;
  onInsertLatex: (expression: string, isBlock?: boolean, cursorOffset?: number) => void;
}

export default function LaTexSelectModal({ onClose, onInsertLatex }: LaTexSelectModalProps) {
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      
      const target = event.target as HTMLElement;
      const modal = document.querySelector('.latex-select-modal');

      if (modal && !modal.contains(target) && !target.closest('.latex-trigger-button')) {
        onClose();
      }
    }
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [onClose]);

  const handleLatexClick = (latex: LatexStructure) => {
    onInsertLatex(latex.expression, latex.isBlock, latex.cursorOffset);
    onClose();
  };

  // Group LaTeX structures by type for better organization
  const inlineStructures = latexStructures.filter(latex => !latex.isBlock);
  const blockStructures = latexStructures.filter(latex => latex.isBlock);

  return (
    <div 
      className='latex-select-modal absolute top-[48px] left-1/2 transform -translate-x-1/2 w-[320px] max-h-[400px] overflow-y-auto no-scrollbar rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-3' style={{backgroundColor: grayColor4}}
    >
      <div className='pb-2 px-4'>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600, 
            color: 'white',
            fontSize: '14px'
          }}
        >
          Insert LaTeX Expression
        </Typography>
      </div>
      
      <List sx={{ padding: 0 }}>
        {/* Inline LaTeX Section */}
        {inlineStructures.length > 0 && (
          <>
            <div className='py-1 px-4'>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Inline
              </Typography>
            </div>
            {inlineStructures.map((latex) => (
              <ListItem
                key={latex.name}
                onClick={() => handleLatexClick(latex)}
                sx={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  minHeight: '44px',
                  '&:hover': { 
                    backgroundColor: grayColor5 
                  },
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div className='flex items-center gap-3 w-full' >
                  <div className='flex items-center justify-center min-w-[32px] h-[32px] rounded-md bg-blue-100 text-blue-600 text-sm font-medium'>
                    {latex.icon}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <Typography 
                      sx={{ 
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'white',
                        marginBottom: '2px'
                      }}
                    >
                      {latex.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '11px',
                        lineHeight: 1.2,
                        color: 'white',
                      }}
                    >
                      {latex.description}
                    </Typography>
                  </div>
                </div>
              </ListItem>
            ))}
          </>
        )}

        {/* Divider between sections */}
        {inlineStructures.length > 0 && blockStructures.length > 0 && (
          <Divider sx={{ margin: '8px 0' }} />
        )}

        {/* Block LaTeX Section */}
        {blockStructures.length > 0 && (
          <>
            <div className='py-1 px-4'>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Block
              </Typography>
            </div>
            {blockStructures.map((latex) => (
              <ListItem
                key={latex.name}
                onClick={() => handleLatexClick(latex)}
                sx={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  minHeight: '44px',
                  '&:hover': { 
                    backgroundColor: grayColor5 
                  },
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div className='flex items-center gap-3 w-full' >
                  <div className='flex items-center justify-center min-w-[32px] h-[32px] rounded-md bg-blue-100 text-blue-600 text-sm font-medium'>
                    {latex.icon}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <Typography 
                      sx={{ 
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'white',
                        // color: 'text.primary',
                        marginBottom: '2px'
                      }}
                    >
                      {latex.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '11px',
                        lineHeight: 1.2,
                        color: 'white',
                      }}
                    >
                      {latex.description}
                    </Typography>
                  </div>
                </div>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </div>
  )
}