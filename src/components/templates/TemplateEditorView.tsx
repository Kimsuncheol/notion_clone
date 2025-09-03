"use client";

import React from 'react';
import TemplateEditorHeader from './TemplateEditorHeader';
import TemplatePreviewEditor from './TemplatePreviewEditor';
import { Template } from '@/types/templates';

interface TemplateEditorViewProps {
  selectedTemplate: Template;
  tempTitle: string;
  isCreating: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onCreateNote: () => void;

}

const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({
  selectedTemplate,
  tempTitle,
  isCreating,
  onBack,
  onTitleChange,
  onCreateNote,

}) => {
  return (
    <div className="min-h-screen">
      <TemplateEditorHeader
        selectedTemplate={selectedTemplate}
        tempTitle={tempTitle}
        isCreating={isCreating}
        onBack={onBack}
        onTitleChange={onTitleChange}
        onCreateNote={onCreateNote}
      />

      <div className="w-[80%] mx-auto">
        <TemplatePreviewEditor
          template={selectedTemplate}
          initialTitle={tempTitle}
          onTitleChange={onTitleChange}
        />
      </div>
    </div>
  );
};

export default TemplateEditorView; 