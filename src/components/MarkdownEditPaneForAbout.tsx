import React, { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownKeymap } from '@codemirror/lang-markdown';
import { search } from '@codemirror/search';
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
import { Extension } from '@codemirror/state';
import { latexExtension } from './markdown/latexExtension';
import { arrowInput } from './markdown/editorConfig';
import { createFormatterExtension } from './markdown/codeFormatter';
import { grayColor2 } from '@/constants/color';

interface MarkdownEditPaneForAboutProps {
  contentForAbout: string;
  theme: Extension;
  onContentChange: (value: string) => void;
  isDarkMode: boolean;
  editorRef: React.RefObject<EditorView | null>;
}

const MarkdownEditPaneForAbout: React.FC<MarkdownEditPaneForAboutProps> = ({
  contentForAbout: content,
  theme,
  onContentChange,
  isDarkMode,
  editorRef,
}) => {
  const bgTheme = EditorView.theme({
    "&": { backgroundColor: grayColor2 },
    ".cm-scroller": { overflow: 'auto', backgroundColor: grayColor2 },
    ".cm-content": { backgroundColor: grayColor2 },
    "&.cm-editor, .cm-scroller": { backgroundColor: grayColor2 },
    ".cm-gutters": { backgroundColor: grayColor2 },
    ".cm-focused": { backgroundColor: grayColor2 },
  });

  const extensions = [
    bgTheme,
    keymap.of(markdownKeymap),
    latexExtension(isDarkMode),
    markdown({
      codeLanguages: (info) => {
        if (info === 'latex' || info === 'tex') {
          return StreamLanguage.define(stex);
        }
        return null;
      },
    }),
    search({ top: true, caseSensitive: false, wholeWord: true }),
    EditorView.lineWrapping,
    autocompletion({
      maxRenderedOptions: 100,
      activateOnTyping: true,
      activateOnTypingDelay: 300,
      selectOnOpen: true,
      compareCompletions: (a, b) => a.label.localeCompare(b.label),
    }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    indentOnInput(),
    arrowInput,
    bracketMatching(),
    createFormatterExtension(),
  ];

  return (
    <div className="flex flex-col w-full overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 234px)' }}>
      <div className="flex-1 no-scrollbar">
        <CodeMirror
          id="markdown-editor-about"
          value={content}
          onChange={onContentChange}
          extensions={extensions}
          theme={theme}
          placeholder=""
          minHeight={`${document.documentElement.clientHeight - 169}px`}
          className="no-scrollbar"
          onCreateEditor={(view) => {
            if (editorRef) {
              (editorRef as React.MutableRefObject<EditorView | null>).current = view;
            }
          }}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            closeBrackets: true,
            indentOnInput: true,
            bracketMatching: true,
            lintKeymap: true,
            autocompletion: true,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
          }}
          style={{
            fontSize: '14px',
            backgroundColor: grayColor2,
            zIndex: -1,
            height: 'calc(100vh - 169px)',
            overflowY: 'auto',
            padding: '16px',
          }}
        />
      </div>
    </div>
  );
};

export default memo(MarkdownEditPaneForAbout);
