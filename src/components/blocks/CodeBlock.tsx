'use client';
import React, { KeyboardEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CodeBlock as CodeBlockType } from '@/types/blocks';
import { useEditMode } from '@/contexts/EditModeContext';
import { executeCode, canExecuteLanguage, type ExecutionResult } from '@/services/codeExecution';

export interface CodeBlockHandle {
  focus: () => void;
}

interface Props {
  block: CodeBlockType;
  onUpdate: (content: { code: string; language: string }) => void;
  onAddBelow: (id: string) => void;
  onArrowPrev: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onArrowNext: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onRemove: (id: string) => void;
}

const COMMON_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php',
  'ruby', 'html', 'css', 'json', 'xml', 'yaml', 'sql', 'bash', 'shell', 'plaintext'
];

const CodeBlock = forwardRef<CodeBlockHandle, Props>(({ block, onUpdate, onAddBelow, onArrowPrev, onArrowNext, onRemove }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const languageSelectRef = useRef<HTMLSelectElement>(null);
  const { isEditMode } = useEditMode();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isEditMode) {
      onUpdate({
        code: e.target.value,
        language: block.content.language || 'javascript'
      });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isEditMode) {
      onUpdate({
        code: block.content.code || '',
        language: e.target.value
      });
      setShowLanguageDropdown(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isEditMode) return;

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      
      onUpdate({
        code: newValue,
        language: block.content.language || 'javascript'
      });
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Handle Enter to add new line within the code block
    if (e.key === 'Enter') {
      // Allow normal Enter behavior within code block
      return;
    }

    // Handle Backspace on empty code block
    if (e.key === 'Backspace' && (block.content.code || '') === '') {
      e.preventDefault();
      onRemove(block.id);
      return;
    }

    // Handle Escape to exit code block
    if (e.key === 'Escape') {
      e.preventDefault();
      onAddBelow(block.id);
      return;
    }

    // Handle Ctrl/Cmd + Enter to exit and add block below
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onAddBelow(block.id);
      return;
    }
  };

  const handleArrowKeys = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isEditMode) return;
    
    const textarea = e.currentTarget;
    const lines = textarea.value.split('\n');
    const currentPosition = textarea.selectionStart;
    
    // Calculate current line and column
    let currentLine = 0;
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= currentPosition) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline character
    }

    // If at the first line and pressing up, move to previous block
    if (e.key === 'ArrowUp' && currentLine === 0) {
      e.preventDefault();
      onArrowPrev(block.id);
      return;
    }

    // If at the last line and pressing down, move to next block
    if (e.key === 'ArrowDown' && currentLine === lines.length - 1) {
      e.preventDefault();
      onArrowNext(block.id);
      return;
    }
  };

  const handleExecuteCode = async () => {
    if (!block.content.code || !block.content.code.trim()) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'No code to execute'
      });
      setShowOutput(true);
      return;
    }

    setIsExecuting(true);
    setShowOutput(true);
    
    try {
      const result = await executeCode({
        code: block.content.code,
        language: block.content.language || 'javascript'
      });
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getLanguageDisplayName = (lang: string | undefined) => {
    // Default to 'javascript' if lang is undefined or null
    const safeLang = lang || 'javascript';
    
    const displayNames: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'sql': 'SQL',
      'bash': 'Bash',
      'shell': 'Shell',
      'plaintext': 'Plain Text'
    };
    return displayNames[safeLang] || safeLang.charAt(0).toUpperCase() + safeLang.slice(1);
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Header with language selector */}
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {getLanguageDisplayName(block.content.language)}
          </span>
          {isEditMode && (
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              title="Change language"
            >
              ⚙️
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canExecuteLanguage(block.content.language || 'javascript') && (
            <button
              onClick={handleExecuteCode}
              disabled={isExecuting}
              className="text-xs px-3 py-1 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 rounded flex items-center gap-1"
              title="Execute code"
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                  Running...
                </>
              ) : (
                <>
                  ▶️ Run
                </>
              )}
            </button>
          )}
          {showOutput && (
            <button
              onClick={() => setShowOutput(!showOutput)}
              className="text-xs px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded"
              title="Toggle output"
            >
              📋 Output
            </button>
          )}
          <span className="text-xs text-gray-500">Code Block</span>
        </div>
      </div>

      {/* Language dropdown */}
      {showLanguageDropdown && isEditMode && (
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b border-gray-300 dark:border-gray-600">
          <select
            ref={languageSelectRef}
            value={block.content.language || 'javascript'}
            onChange={handleLanguageChange}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            title="Select programming language"
            autoFocus
          >
            {COMMON_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {getLanguageDisplayName(lang)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={block.content.code || ''}
          onChange={handleCodeChange}
          onKeyDown={(e) => {
            handleKeyDown(e);
            handleArrowKeys(e);
          }}
          placeholder={isEditMode ? `Enter your code here...\nPress Tab for indentation\nPress ${String.fromCharCode(0x2191)} ${String.fromCharCode(0x2193)} to exit` : ""}
          className={`w-full bg-transparent text-sm font-mono p-3 resize-none focus:outline-none min-h-[120px] ${
            !isEditMode ? 'cursor-default' : ''
          }`}
          style={{
            backgroundColor: 'transparent',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2,
          }}
          disabled={!isEditMode}
          readOnly={!isEditMode}
          rows={Math.max(6, (block.content.code || '').split('\n').length + 1)}
        />
      </div>

      {isEditMode && (
        <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1 text-xs text-gray-500 border-t border-gray-300 dark:border-gray-600">
          💡 Tab: indent • Ctrl/Cmd+Enter: exit • Escape: exit and add new block
        </div>
      )}

      {/* Output section */}
      {showOutput && executionResult && (
        <div className="border-t border-gray-300 dark:border-gray-600">
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {executionResult.success ? '✅ Output' : '❌ Error'}
              </span>
              {executionResult.executionTime !== undefined && (
                <span className="text-xs text-gray-400">
                  ({executionResult.executionTime}ms)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowOutput(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
              title="Close output"
            >
              ✖
            </button>
          </div>
          <div className="bg-black text-green-400 p-3 font-mono text-sm max-h-48 overflow-y-auto">
            {executionResult.success ? (
              <pre className="whitespace-pre-wrap">{executionResult.output}</pre>
            ) : (
              <div>
                {executionResult.output && (
                  <pre className="whitespace-pre-wrap text-yellow-400 mb-2">{executionResult.output}</pre>
                )}
                <pre className="whitespace-pre-wrap text-red-400">{executionResult.error}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock; 