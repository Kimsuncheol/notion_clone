'use client';
import React, { useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import { addNotePage, updateNoteContent } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import Header from '@/components/Header';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
import ManualModal from '@/components/ManualModal';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { Block } from '@/types/blocks';

// Template definitions
interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  blocks: Block[];
  preview: string;
}

const templates: Template[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Structure for productive meeting documentation',
    category: 'Business',
    emoji: '📝',
    preview: 'Meeting agenda, attendees, action items...',
    blocks: [
      { id: 'title', type: 'styled', className: 'text-2xl font-bold mb-4', content: 'Meeting Notes - [Date]' },
      { id: 'meta', type: 'text', content: '**Date:** [Enter date]\n**Time:** [Enter time]\n**Location:** [Enter location]' },
      { id: 'attendees', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Attendees' },
      { id: 'attendees-list', type: 'list', content: [{ text: 'Name 1', level: 0 }, { text: 'Name 2', level: 0 }] },
      { id: 'agenda', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Agenda' },
      { id: 'agenda-list', type: 'orderedlist', content: [{ text: 'Topic 1', level: 0, numberType: '1' }, { text: 'Topic 2', level: 0, numberType: '1' }] },
      { id: 'notes', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Notes' },
      { id: 'notes-content', type: 'text', content: '[Meeting discussion notes...]' },
      { id: 'actions', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Action Items' },
      { id: 'actions-table', type: 'table', content: { cells: { '0-0': 'Task', '0-1': 'Assignee', '0-2': 'Due Date' }, rows: 3, cols: 3 } }
    ]
  },
  {
    id: 'project-plan',
    title: 'Project Plan',
    description: 'Comprehensive project planning template',
    category: 'Business',
    emoji: '📋',
    preview: 'Project overview, timeline, milestones...',
    blocks: [
      { id: 'title', type: 'styled', className: 'text-3xl font-bold mb-4', content: 'Project Plan: [Project Name]' },
      { id: 'overview', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Project Overview' },
      { id: 'overview-content', type: 'text', content: '**Objective:** [Main goal of the project]\n**Scope:** [What is included/excluded]\n**Timeline:** [Start date - End date]' },
      { id: 'stakeholders', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Stakeholders' },
      { id: 'stakeholders-table', type: 'table', content: { cells: { '0-0': 'Name', '0-1': 'Role', '0-2': 'Responsibility' }, rows: 4, cols: 3 } },
      { id: 'milestones', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Key Milestones' },
      { id: 'milestones-list', type: 'orderedlist', content: [{ text: 'Milestone 1 - [Date]', level: 0, numberType: '1' }, { text: 'Milestone 2 - [Date]', level: 0, numberType: '1' }] },
      { id: 'risks', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Risk Assessment' },
      { id: 'risks-table', type: 'table', content: { cells: { '0-0': 'Risk', '0-1': 'Impact', '0-2': 'Mitigation' }, rows: 4, cols: 3 } }
    ]
  },
  {
    id: 'daily-journal',
    title: 'Daily Journal',
    description: 'Personal reflection and daily planning',
    category: 'Personal',
    emoji: '📖',
    preview: 'Gratitude, goals, reflections...',
    blocks: [
      { id: 'date', type: 'styled', className: 'text-2xl font-bold mb-4', content: 'Daily Journal - [Date]' },
      { id: 'mood', type: 'text', content: '**Today I feel:** [Describe your mood]' },
      { id: 'gratitude', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Gratitude' },
      { id: 'gratitude-list', type: 'list', content: [{ text: 'Something I\'m grateful for', level: 0 }, { text: 'Another thing I appreciate', level: 0 }] },
      { id: 'goals', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Today\'s Goals' },
      { id: 'goals-list', type: 'orderedlist', content: [{ text: 'Priority task 1', level: 0, numberType: '1' }, { text: 'Priority task 2', level: 0, numberType: '1' }] },
      { id: 'highlights', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Highlights' },
      { id: 'highlights-content', type: 'text', content: '[What were the best parts of today?]' },
      { id: 'reflection', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Evening Reflection' },
      { id: 'reflection-content', type: 'text', content: '[What did I learn today? What could I improve tomorrow?]' }
    ]
  },
  {
    id: 'recipe',
    title: 'Recipe',
    description: 'Document your favorite recipes',
    category: 'Personal',
    emoji: '👨‍🍳',
    preview: 'Ingredients, instructions, notes...',
    blocks: [
      { id: 'title', type: 'styled', className: 'text-3xl font-bold mb-4', content: '[Recipe Name]' },
      { id: 'meta', type: 'text', content: '**Prep Time:** [X minutes]\n**Cook Time:** [X minutes]\n**Servings:** [X people]' },
      { id: 'description', type: 'text', content: '[Brief description of the dish]' },
      { id: 'ingredients', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Ingredients' },
      { id: 'ingredients-list', type: 'list', content: [{ text: '1 cup of flour', level: 0 }, { text: '2 eggs', level: 0 }, { text: '1/2 cup milk', level: 0 }] },
      { id: 'instructions', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Instructions' },
      { id: 'instructions-list', type: 'orderedlist', content: [{ text: 'Preheat oven to [temperature]', level: 0, numberType: '1' }, { text: 'Mix dry ingredients', level: 0, numberType: '1' }] },
      { id: 'notes', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Chef\'s Notes' },
      { id: 'notes-content', type: 'text', content: '[Tips, variations, or personal notes about this recipe]' }
    ]
  },
  {
    id: 'bug-report',
    title: 'Bug Report',
    description: 'Technical issue documentation',
    category: 'Development',
    emoji: '🐛',
    preview: 'Steps to reproduce, expected behavior...',
    blocks: [
      { id: 'title', type: 'styled', className: 'text-2xl font-bold mb-4', content: 'Bug Report: [Brief Description]' },
      { id: 'meta', type: 'text', content: '**Date:** [Date]\n**Reporter:** [Your name]\n**Priority:** [High/Medium/Low]' },
      { id: 'summary', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Summary' },
      { id: 'summary-content', type: 'text', content: '[One-line description of the bug]' },
      { id: 'environment', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Environment' },
      { id: 'environment-content', type: 'text', content: '**OS:** [Operating System]\n**Browser:** [Browser and version]\n**Version:** [App version]' },
      { id: 'reproduce', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Steps to Reproduce' },
      { id: 'reproduce-list', type: 'orderedlist', content: [{ text: 'Step 1', level: 0, numberType: '1' }, { text: 'Step 2', level: 0, numberType: '1' }] },
      { id: 'expected', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Expected Behavior' },
      { id: 'expected-content', type: 'text', content: '[What should happen]' },
      { id: 'actual', type: 'styled', className: 'text-lg font-semibold mt-6 mb-2', content: 'Actual Behavior' },
      { id: 'actual-content', type: 'text', content: '[What actually happens]' }
    ]
  },
  {
    id: 'study-notes',
    title: 'Study Notes',
    description: 'Academic subject study template',
    category: 'Education',
    emoji: '📚',
    preview: 'Key concepts, examples, review questions...',
    blocks: [
      { id: 'title', type: 'styled', className: 'text-3xl font-bold mb-4', content: '[Subject] - [Chapter/Topic]' },
      { id: 'meta', type: 'text', content: '**Date:** [Date]\n**Class:** [Course name]\n**Professor:** [Instructor name]' },
      { id: 'objectives', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Learning Objectives' },
      { id: 'objectives-list', type: 'list', content: [{ text: 'Understand concept A', level: 0 }, { text: 'Apply method B', level: 0 }] },
      { id: 'concepts', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Key Concepts' },
      { id: 'concepts-table', type: 'table', content: { cells: { '0-0': 'Term', '0-1': 'Definition', '0-2': 'Example' }, rows: 4, cols: 3 } },
      { id: 'examples', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Examples' },
      { id: 'examples-content', type: 'text', content: '[Worked examples and practice problems]' },
      { id: 'summary', type: 'styled', className: 'text-xl font-semibold mt-6 mb-2', content: 'Summary' },
      { id: 'summary-content', type: 'text', content: '[Key takeaways from this study session]' }
    ]
  }
];

const categories = ['All', 'Business', 'Personal', 'Development', 'Education'];

export default function TemplatesPage() {
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreating, setIsCreating] = useState<string | null>(null);
  
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<SidebarHandle>(null);
  
  const { showManual, setShowManual } = useModalStore();

  const handleSelectPage = (id: string) => {
    setSelectedPageId(id);
    router.push(`/note/${id}`);
  };

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const createNoteFromTemplate = async (template: Template) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

    setIsCreating(template.id);
    try {
      // Import the fetchFolders function to get user folders
      const { fetchFolders } = await import('@/services/firebase');
      const folders = await fetchFolders();
      
      // Find private folder (assuming it exists)
      const privateFolder = folders.find(f => f.folderType === 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      // Create the page
      const pageId = await addNotePage(privateFolder.id, template.title);
      
      // Add template content to the note
      await updateNoteContent(pageId, template.title, template.blocks, false);
      
      // Refresh sidebar data
      dispatch(loadSidebarData());
      
      toast.success(`Created "${template.title}" from template`);
      
      // Navigate to the new note
      router.push(`/note/${pageId}`);
    } catch (error) {
      console.error('Error creating note from template:', error);
      toast.error('Failed to create note from template');
    } finally {
      setIsCreating(null);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-500 mb-6">Please sign in to access templates</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
      
      <div className="flex-1 flex flex-col">
        <Header onOpenManual={() => setShowManual(true)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Templates</h1>
              <p className="text-gray-500">
                Get started quickly with pre-designed templates for common use cases
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => createNoteFromTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{template.emoji}</div>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {template.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {template.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-600 pt-3">
                    {template.preview}
                  </div>
                  
                  {isCreating === template.id && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-2 text-blue-500">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        Creating...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-gray-500">
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Manual Modal */}
      <ManualModal
        open={showManual}
        onClose={() => setShowManual(false)}
      />
    </div>
  );
} 