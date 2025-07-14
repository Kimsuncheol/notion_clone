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
  onSaveTitle: (title: string) => void;
}

const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({
  selectedTemplate,
  tempTitle,
  isCreating,
  onBack,
  onTitleChange,
  onCreateNote,
  onSaveTitle,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <TemplateEditorHeader
        selectedTemplate={selectedTemplate}
        tempTitle={tempTitle}
        isCreating={isCreating}
        onBack={onBack}
        onTitleChange={onTitleChange}
        onCreateNote={onCreateNote}
      />

      <div className="max-w-7xl mx-auto">
        <TemplatePreviewEditor
          template={selectedTemplate}
          initialTitle={tempTitle}
          onTitleChange={onSaveTitle}
        />
      </div>
    </div>
  );
};

export default TemplateEditorView; 