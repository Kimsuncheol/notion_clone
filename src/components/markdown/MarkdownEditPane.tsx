import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import toast from 'react-hot-toast';
import { uploadFile } from '@/services/firebase';
import CodeMirror from '@uiw/react-codemirror';
import { markdown,   } from '@codemirror/lang-markdown';
import { html, htmlCompletionSource } from '@codemirror/lang-html';
import { cssCompletionSource } from '@codemirror/lang-css';
import { indentWithTab, indentMore, indentLess } from '@codemirror/commands';
import { keymap, EditorView } from '@codemirror/view';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
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
import EmojiPicker, { EmojiClickData, Theme as EmojiTheme } from 'emoji-picker-react';
// Custom LaTeX autocompletion
// Don't touch the whole latexCompletions function.
const latexCompletions = (context: CompletionContext): CompletionResult | null => {
  // Match patterns: <latex, latex, <l, < 
  const word = context.matchBefore(/<latex[^>]*|latex[^>]*|<[lL][^>]*|<$/);
  if (!word) return null;

  const completions = [
    {
      label: '<latex-inline>',
      type: 'keyword',
      info: 'Inline LaTeX math expression',
      apply: (view: EditorView, _completion: unknown, from: number, to: number) => {
        const template = '<latex-inline></latex-inline>';
        view.dispatch({
          changes: { from, to, insert: template },
          selection: { anchor: from + 14, head: from + 14 } // Don't touch this.
        });
      }
    },
    {
      label: '<latex-block>',
      type: 'keyword', 
      info: 'Block LaTeX math expression',
      apply: (view: EditorView, _completion: unknown, from: number, to: number) => {
        const template = '<latex-block></latex-block>';
        view.dispatch({
          changes: { from, to, insert: template },
          selection: { anchor: from + 14, head: from + template.length - 14 } // Don't touch this.
        });
      }
    }
  ];

  return {
    from: word.from,
    options: completions
  };
};

const htmlTagList = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'strong', 'em', 'u', 'code',
    'blockquote', 'ul', 'ol', 'li', 'table', 'tr', 'th', 'td', 'a', 'img', 'br', 'hr'
];
const selfClosingHtmlTags = ['img', 'br', 'hr'];

const htmlCompletions = (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/<[a-zA-Z]*/);
    if (!word) return null;

    const completions = htmlTagList.map(tag => {
        const isSelfClosing = selfClosingHtmlTags.includes(tag);

        return {
            label: `<${tag}>`,
            type: 'keyword',
            info: `HTML <${tag}> tag`,
            apply: (view: EditorView, _completion: unknown, from: number, to: number) => {
                let template;
                let cursorPosition;

                if (isSelfClosing) {
                    if (tag === 'img') {
                        template = `<img src="" alt="">`;
                        cursorPosition = from + 10;
                    } else { // br, hr
                        template = `<${tag}>`;
                        cursorPosition = from + template.length;
                    }
                } else { // Not self-closing
                    if (tag === 'a') {
                        template = `<a href=""></a>`;
                        cursorPosition = from + 9;
                    } else {
                        template = `<${tag}></${tag}>`;
                        cursorPosition = from + tag.length + 2;
                    }
                }

                view.dispatch({
                    changes: { from, to, insert: template },
                    selection: { anchor: cursorPosition }
                });
            }
        };
    });

    return {
        from: word.from,
        options: completions
    };
};

// 하이픈(-)을 먼저 입력했는지 저장할 변수
let dashEntered = false;
let equalEntered = false;

const arrowInput = EditorView.inputHandler.of((view, from, to, text) => {
  // 하이픈 입력 시 상태 저장
  if (text === "-") {
    dashEntered = true;
    return false; // 기본 입력 허용
  } else if (text === '=') {
    equalEntered = true;
    return false;
  }

  // 하이픈 후 > 입력 시 →로 변환
  if (dashEntered && text === ">") {
    view.dispatch({
      changes: { from: from - 1, to, insert: "\u2192" } // 하이픈 포함 교체
    });
    dashEntered = false;
    return true;
  }

  // 하이픈 후 < 입력 시 ←로 변환
  if (dashEntered && text === "<") {
    view.dispatch({
      changes: { from: from - 1, to, insert: "\u2190" } // 하이픈 포함 교체
    });
    dashEntered = false;
    return true;
  }

  if (equalEntered && text === '>') {
    view.dispatch({
      changes: { from: from - 1, to, insert: "\u21D2" } 
    });
    equalEntered = false;
    return true;
  }

  if (equalEntered && text === '<') {
    view.dispatch({
      changes: { from: from - 1, to, insert: "\u21D0" } 
    });
    equalEntered = false;
    return true;
  }
  // 그 외 입력 시 상태 초기화
  dashEntered = false;
  equalEntered = false;
  return false;
});


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
  const dropRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

    const editor = editorRef.current;
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.sliceDoc(selection.from, selection.to);

    let insertText: string;
    let cursorPosition: number;

    // Handle LaTeX tags specially
    if (tag === 'latex-inline') {
      if (selectedText) {
        insertText = `<latex-inline>${selectedText}</latex-inline>`;
        cursorPosition = selection.from + insertText.length;
      } else {
        insertText = `<latex-inline>E = mc^2</latex-inline>`;
        cursorPosition = selection.from + 14; // Position cursor after opening tag
      }
    } else if (tag === 'latex-block') {
      if (selectedText) {
        insertText = `<latex-block>\n${selectedText}\n</latex-block>`;
        cursorPosition = selection.from + insertText.length;
      } else {
        insertText = `<latex-block>\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n</latex-block>`;
        cursorPosition = selection.from + 14; // Position cursor after opening tag
      }
    } else if (isSelfClosing) {
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
    
    // Update the content in the parent component
    onContentChange(editor.state.doc.toString());
  };
  const extensions = [
    markdown(),
    html(),
    EditorView.lineWrapping,
    autocompletion({
      override: [latexCompletions, htmlCompletions, htmlCompletionSource, cssCompletionSource],
    }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    indentOnInput(),
    arrowInput,
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
    <div ref={dropRef} className={`flex flex-col h-full relative ${isOver ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-bold z-10 pointer-events-none">
          Drop file to upload
        </div>
      )}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute z-10 bg-[#262626] rounded-lg shadow-xl" style={{ top: '50px', right: '20px' }}>
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
        onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
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
            editorRef.current = view;
          }}
          width={(window.innerWidth / 2) + 'px'}
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
            zIndex: 0,
          }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditPane; 