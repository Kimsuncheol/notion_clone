'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { addNotePage } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import toast from 'react-hot-toast';
import { Template } from '@/types/templates';
import { templates, categories } from '@/data/templates';
import TemplateEditorView from '@/components/templates/TemplateEditorView';
import TemplateGalleryView from '@/components/templates/TemplateGalleryView';
import { updateNoteContent } from '@/services/markdown/firebase';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('templates');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/signin');
    }
  }, [auth.currentUser, router]);

  // Removed sidebar loading as sidebar functionality was removed

  // Keyboard shortcut for toggling sidebar (Cmd+\ or Ctrl+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setTempTitle(template.name);
    setShowEditor(true);
  };

  const handleCreateNote = async () => {
    if (!selectedTemplate || !tempTitle.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    setIsCreating(true);
    try {
      // Create note without folder dependency - simplified approach
      const pageId = await addNotePage('default', tempTitle);
      
      // Automatically save the template content to the note with isPublic: false
      await updateNoteContent(
        pageId,
        tempTitle,
        tempTitle, // publishTitle same as title
        selectedTemplate.content,
        '', // empty publishContent initially
        false, // isPublic: false to show in private folder
        false, // isPublished: false initially
        undefined // no thumbnail
      );
      
      router.push(`/note/${pageId}`);
      toast.success('Note created from template!');
    } catch (error) {
      console.error('Error creating note from template:', error);
      toast.error('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    if (showEditor) {
      setShowEditor(false);
      setSelectedTemplate(null);
      setTempTitle('');
    } else {
      router.push('/dashboard');
    }
  };



  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  if (!auth.currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Please sign in to access templates</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-sm sm:text-base" >
      
      <div className="flex-1">
        {showEditor && selectedTemplate ? (
          <TemplateEditorView
            selectedTemplate={selectedTemplate}
            tempTitle={tempTitle}
            isCreating={isCreating}
            onBack={handleBack}
            onTitleChange={setTempTitle}
            onCreateNote={handleCreateNote}

          />
        ) : (
          <TemplateGalleryView
            categories={categories}
            selectedCategory={selectedCategory}
            filteredTemplates={filteredTemplates}
            onBack={handleBack}
            onCategorySelect={setSelectedCategory}
            onTemplateSelect={handleTemplateSelect}
          />
        )}
      </div>
    </div>
  );
}
