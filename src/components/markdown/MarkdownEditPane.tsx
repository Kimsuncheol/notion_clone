import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import toast from 'react-hot-toast';
import { uploadFile } from '@/services/firebase';
import CodeMirror from '@uiw/react-codemirror';
import { markdown,   } from '@codemirror/lang-markdown';
import { htmlCompletionSource, html } from '@codemirror/lang-html';
import { css, cssCompletionSource } from '@codemirror/lang-css';
import { search } from '@codemirror/search';
import { indentMore, indentLess } from '@codemirror/commands';
import { keymap, EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { stex } from '@codemirror/legacy-modes/mode/stex';

import { 
  syntaxHighlighting, 
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  StreamLanguage
} from '@codemirror/language';
import { Extension, Prec } from '@codemirror/state';
import MarkdownUtilityBar from './MarkdownUtilityBar';
import { ThemeOption } from './ThemeSelector';
import EmojiPicker, { EmojiClickData, Theme as EmojiTheme } from 'emoji-picker-react';
import { htmlCompletions, arrowInput } from './editorConfig';
import { createFormatterExtension } from './codeFormatter';
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { latexExtension } from './latexExtension';
import { latexCompletions } from './latexAutocompletion';

interface MarkdownEditPaneProps {
  content: string;
  theme: Extension;
  onContentChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  currentTheme: string;
  themes: ThemeOption[];
  isDarkMode: boolean;
  onThemeChange: (themeValue: string) => void;
  onFormatCode: () => void;
  editorRef: React.RefObject<EditorView | null>;
}

const MarkdownEditPane: React.FC<MarkdownEditPaneProps> = ({
  content,
  theme,
  onContentChange,
  onSave,
  isSaving,
  currentTheme,
  themes,
  isDarkMode,
  onThemeChange,
  onFormatCode,
  editorRef,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const activateOnTypingDelay = 300;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleFileDrop = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const fileType = file.type;
    let tagToInsert = '';

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const downloadUrl = await uploadFile(file, (progress) => {
        toast.loading(`Uploading ${file.name}: ${Math.round(progress.progress)}%`, { id: toastId });
      });

      if (fileType.startsWith('image/')) {
        tagToInsert = `<img src="${downloadUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
      } else if (fileType.startsWith('video/')) {
        tagToInsert = `<video src="${downloadUrl}" controls width="100%"></video>`;
      } else if (fileType === 'application/pdf') {
        tagToInsert = `<iframe src="${downloadUrl}" width="100%" height="600px" title="${file.name}"></iframe>`;
      } else {
        toast.dismiss(toastId);
        toast.error(`Unsupported file type: ${fileType}`);
        return;
      }

      const editor = editorRef.current;
      if (editor) {
        const { state } = editor;
        const insertPosition = state.selection.main.to;
        const newContent = content.slice(0, insertPosition) + `\n${tagToInsert}\n` + content.slice(insertPosition);
        
        // Update the parent component's state first
        onContentChange(newContent);
        
        // Then update the editor selection
        setTimeout(() => {
          if (editorRef.current) {
            const transaction = editorRef.current.state.update({
              selection: { anchor: insertPosition + tagToInsert.length + 2 }
            });
            editorRef.current.dispatch(transaction);
            editorRef.current.focus();
          }
        }, 0);
      }
      toast.success(`${file.name} uploaded and inserted.`, { id: toastId });
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(`Failed to upload ${file.name}.`, { id: toastId });
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files: File[] }) => handleFileDrop(item.files),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), []);

  drop(dropRef);

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const state = editor.state;
    const selection = state.selection.main;
    const insertText = emojiData.emoji;
    const transaction = state.update({
      changes: { from: selection.from, to: selection.to, insert: insertText },
      selection: { anchor: selection.from + insertText.length },
    });
    editor.dispatch(transaction);
    editor.focus();
    onContentChange(editor.state.doc.toString());
    setShowEmojiPicker(false);
  };

  const handleInsertTag = (tag: string, isSelfClosing?: boolean) => {
    if (!editorRef.current) return;

    // Validate tag name to prevent invalid HTML
    if (!tag || typeof tag !== 'string') {
      console.error('Invalid tag provided:', tag);
      return;
    }

    // Sanitize tag to remove any invalid characters
    const sanitizedTag = tag.replace(/[<>]/g, '');
    if (!sanitizedTag.trim()) {
      console.error('Tag becomes empty after sanitization:', tag);
      return;
    }

    const editor = editorRef.current;
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to);

    let insertText: string;
    let cursorPosition: number;

    if (isSelfClosing) {
      // Self-closing tags (br, hr, img, etc.)
      insertText = `<${sanitizedTag} />`;
      cursorPosition = selection.from + insertText.length;
    } else {
      // Regular tags that wrap content
      if (selectedText) {
        // Wrap selected text
        const tagName = sanitizedTag.split(' ')[0]; // Get tag name without attributes
        insertText = `<${sanitizedTag}>${selectedText}</${tagName}>`;
        cursorPosition = selection.from + insertText.length;
      } else {
        // Insert empty tag with cursor positioned inside
        const tagName = sanitizedTag.split(' ')[0]; // Get tag name without attributes
        insertText = `<${sanitizedTag}></${tagName}>`;
        cursorPosition = selection.from + sanitizedTag.length + 2; // Position cursor between opening and closing tags
      }
    }

    // Apply the change
    const transaction = state.update({
      changes: { from: selection.from, to: selection.to, insert: insertText },
      selection: { anchor: cursorPosition }
    });

    editor.dispatch(transaction);
    editor.focus();
    
    // Update the content in the parent component
    onContentChange(editor.state.doc.toString());
  };

  const handleInsertLatex = (expression: string, isBlock?: boolean, cursorOffset?: number) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const state = editor.state;
    const selection = state.selection.main;

    // Replace placeholders: | for cursor position, # for secondary position
    let processedExpression = expression.replace(/\|/g, '');
    
    // For block expressions, add proper formatting
    if (isBlock) {
      processedExpression = processedExpression.replace(/\n\n/g, '\n');
    }

    const transaction = state.update({
      changes: { from: selection.from, to: selection.to, insert: processedExpression },
      selection: { anchor: selection.from + (cursorOffset || processedExpression.length) }
    });

    editor.dispatch(transaction);
    editor.focus();
    
    // Update the content in the parent component
    onContentChange(editor.state.doc.toString());
  };

  const emmetKeymap = Prec.high(keymap.of([
    {
      key: 'Tab',
      run: (view) => expandAbbreviation(view) || indentMore(view),
      preventDefault: true,
    },
    {
      key: 'Shift-Tab',
      run: indentLess,
    },
    {
      key: 'Ctrl-s',
      mac: 'Cmd-s',
      run: () => {
        onSave();
        return true;
      },
    },
  ]));

  const extensions = [
    emmetKeymap, // place first so it has priority,
    latexExtension(isDarkMode), // Add LaTeX support first
    markdown({
      codeLanguages: (info) => {
        if (info === 'latex' || info === 'tex') {
          return StreamLanguage.define(stex);
        }
        return null;
      },
    }),
    html(),
    css(),
    // oneDark,
    search({top: true, caseSensitive: false, wholeWord: true}),
    // htmlLanguage({ matchClosingTags: true, autoCloseTags: true, nestedAttributes: [] }),
    abbreviationTracker(), // Enable Emmet abbreviation tracking
    EditorView.lineWrapping,
    autocompletion({
      override: [htmlCompletionSource, cssCompletionSource, htmlCompletions, latexCompletions],
      maxRenderedOptions: 100,
      activateOnTyping: true,
      activateOnTypingDelay: activateOnTypingDelay,
      selectOnOpen: true,
      compareCompletions: (a, b) => a.label.localeCompare(b.label),
    }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    indentOnInput(),
    arrowInput,
    bracketMatching(),
    createFormatterExtension(), // Add the formatter extension
  ];

  return (
    <div ref={dropRef} className={`flex flex-col h-full relative ${isOver ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-bold z-10 pointer-events-none">
          Drop file to upload
        </div>
      )}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute z-10 bg-[#262626] rounded-lg shadow-xl top-[50px] right-5">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            skinTonesDisabled
            searchDisabled
            previewConfig={{ showPreview: false }}
            height={350}
            width={300}
            theme={isDarkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT}
            lazyLoadEmojis
          />
        </div>
      )}
      <MarkdownUtilityBar
        onInsertTag={handleInsertTag}
        onInsertLatex={handleInsertLatex}
        onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
        onFormatCode={onFormatCode}
        isSaving={isSaving}
        currentTheme={currentTheme}
        themes={themes}
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar bg-transparent">
        <CodeMirror
          value={content}
          onChange={onContentChange}
          extensions={extensions}
          theme={theme}
          placeholder="Write your markdown here..."
          className="h-full"
          onCreateEditor={(view) => {
            if (editorRef) {
              (editorRef as React.MutableRefObject<EditorView | null>).current = view;
            }
          }}
          width={(window.innerWidth / 2) + 'px'}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            lintKeymap: true,
            autocompletion: true,
            highlightActiveLine: true,
            highlightSelectionMatches: false,
          }}
          style={{
            fontSize: '14px',
            height: '100%',
            zIndex: 0,
          }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditPane; 