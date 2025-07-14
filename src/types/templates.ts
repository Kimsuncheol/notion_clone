import React from 'react';

// Template interface definition
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'documentation' | 'article' | 'project' | 'business' | 'education' | 'personal' | 'math';
  content: string;
} 