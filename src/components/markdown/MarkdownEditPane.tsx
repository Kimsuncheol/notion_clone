import React, { useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { indentWithTab, indentMore, indentLess } from '@codemirror/commands';
import { keymap, EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { 
  syntaxHighlighting, 
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  foldGutter,
  codeFolding
} from '@codemirror/language';
import { Extension } from '@codemirror/state';
import MarkdownUtilityBar from './MarkdownUtilityBar';
import { ThemeOption } from './ThemeSelector';

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
}) => {
  const editorRef = useRef<EditorView | null>(null);

  const handleInsertTag = (tag: string, isSelfClosing?: boolean) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to);

    let insertText: string;
    let cursorPosition: number;

    if (isSelfClosing) {
      // Self-closing tags (br, hr, img, etc.)
      insertText = `<${tag} />`;
      cursorPosition = selection.from + insertText.length;
    } else {
      // Regular tags that wrap content
      if (selectedText) {
        // Wrap selected text
        insertText = `<${tag}>${selectedText}</${tag.split(' ')[0]}>`;
        cursorPosition = selection.from + insertText.length;
      } else {
        // Insert empty tag with cursor positioned inside
        const tagName = tag.split(' ')[0]; // Get tag name without attributes
        insertText = `<${tag}></${tagName}>`;
        cursorPosition = selection.from + tag.length + 2; // Position cursor between opening and closing tags
      }
    }

    // Apply the change
    const transaction = state.update({
      changes: { from: selection.from, to: selection.to, insert: insertText },
      selection: { anchor: cursorPosition }
    });

    editor.dispatch(transaction);
    editor.focus();
  };
  const extensions = [
    markdown(),
    html(),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    indentOnInput(),
    bracketMatching(),
    foldGutter(),
    codeFolding(),
    keymap.of([
      indentWithTab,
      {
        key: 'Tab',
        run: indentMore,
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
    ]),
  ];

  return (
    <div className="flex flex-col h-full">
      <MarkdownUtilityBar 
        onInsertTag={handleInsertTag}
        isSaving={isSaving}
        currentTheme={currentTheme}
        themes={themes}
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
      />
      <div className="flex-1 overflow-hidden bg-transparent">
        <CodeMirror
          value={content}
          onChange={onContentChange}
          extensions={extensions}
          theme={theme}
          placeholder="Write your markdown here..."
          className="h-full"
          onCreateEditor={(view) => {
            editorRef.current = view;
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: true,
            highlightActiveLine: true,
            highlightSelectionMatches: false,
          }}
          style={{
            fontSize: '14px',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditPane; 