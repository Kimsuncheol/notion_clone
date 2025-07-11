import { EditorView } from '@codemirror/view';
import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import htmlPlugin from 'prettier/plugins/html';
import postcssPlugin from 'prettier/plugins/postcss';
import markdownPlugin from 'prettier/plugins/markdown';
import toast from 'react-hot-toast';

// Language detection utilities
export const detectLanguageFromContent = (content: string): string => {
  const trimmedContent = content.trim();
  
  // HTML detection
  if (trimmedContent.includes('<!DOCTYPE') || 
      trimmedContent.includes('<html') || 
      /<\/?[a-z][\s\S]*>/i.test(trimmedContent)) {
    return 'html';
  }
  
  // CSS detection
  if (trimmedContent.includes('{') && 
      trimmedContent.includes('}') && 
      trimmedContent.includes(':') &&
      /[a-z-]+\s*:\s*[^;]+;/i.test(trimmedContent)) {
    return 'css';
  }
  
  // JavaScript detection
  if (trimmedContent.includes('function') || 
      trimmedContent.includes('=>') || 
      trimmedContent.includes('const ') ||
      trimmedContent.includes('let ') ||
      trimmedContent.includes('var ') ||
      trimmedContent.includes('import ') ||
      trimmedContent.includes('export ')) {
    return 'javascript';
  }
  
  // JSON detection
  if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
    try {
      JSON.parse(trimmedContent);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }
  
  // Default to markdown for mixed content
  return 'markdown';
};

// Prettier configuration for different languages
const getPrettierConfig = (language: string) => {
  const baseConfig = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed' as const,
    trailingComma: 'es5' as const,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always' as const,
  };

  switch (language) {
    case 'html':
      return {
        ...baseConfig,
        parser: 'html',
        plugins: [htmlPlugin],
        htmlWhitespaceSensitivity: 'css' as const,
      };
    case 'css':
      return {
        ...baseConfig,
        parser: 'css',
        plugins: [postcssPlugin],
      };
    case 'javascript':
    case 'typescript':
      return {
        ...baseConfig,
        parser: 'babel',
        plugins: [babelPlugin],
      };
    case 'json':
      return {
        ...baseConfig,
        parser: 'json',
        plugins: [babelPlugin],
      };
    case 'markdown':
      return {
        ...baseConfig,
        parser: 'markdown',
        plugins: [markdownPlugin],
        proseWrap: 'preserve' as const,
      };
    default:
      return {
        ...baseConfig,
        parser: 'markdown',
        plugins: [markdownPlugin],
        proseWrap: 'preserve' as const,
      };
  }
};

// Format specific language content
export const formatCode = async (content: string, language?: string): Promise<string> => {
  const detectedLanguage = language || detectLanguageFromContent(content);
  
  try {
    const config = getPrettierConfig(detectedLanguage);
    const formatted = await prettier.format(content, config);
    return formatted;
  } catch (error) {
    console.error('Formatting error:', error);
    throw new Error(`Failed to format ${detectedLanguage} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Basic indentation for unsupported languages
const formatWithBasicIndentation = (content: string): string => {
  const lines = content.split('\n');
  let indentLevel = 0;
  const indentSize = 2;
  
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    // Decrease indent for closing brackets/tags
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')') || 
        trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const formatted = ' '.repeat(indentLevel * indentSize) + trimmed;
    
    // Increase indent for opening brackets/tags
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(') ||
        (trimmed.includes('<') && !trimmed.includes('</') && trimmed.endsWith('>'))) {
      indentLevel++;
    }
    
    return formatted;
  }).join('\n');
};

// Format selected text or entire document
export const formatSelection = async (view: EditorView, language?: string): Promise<void> => {
  const { state } = view;
  const { selection } = state;
  const { from, to } = selection.main;
  
  try {
    // Get the content to format
    const hasSelection = from !== to;
    const contentToFormat = hasSelection 
      ? state.sliceDoc(from, to)
      : state.doc.toString();
    
    if (!contentToFormat.trim()) {
      toast.error('No content to format');
      return;
    }
    
    let formattedContent: string;
    
    try {
      // Try Prettier formatting first
      formattedContent = await formatCode(contentToFormat, language);
    } catch (prettierError) {
      console.warn('Prettier formatting failed, using basic indentation:', prettierError);
      // Fallback to basic indentation
      formattedContent = formatWithBasicIndentation(contentToFormat);
      toast.success('Formatted with basic indentation (Prettier not available for this content)');
    }
    
    // Apply the formatting
    if (hasSelection) {
      // Format only the selected text
      const transaction = state.update({
        changes: { from, to, insert: formattedContent },
        selection: { anchor: from, head: from + formattedContent.length }
      });
      view.dispatch(transaction);
    } else {
      // Format the entire document
      const transaction = state.update({
        changes: { from: 0, to: state.doc.length, insert: formattedContent },
        selection: { anchor: 0 }
      });
      view.dispatch(transaction);
    }
    
    if (!formattedContent.includes('basic indentation')) {
      toast.success(`Code formatted successfully`);
    }
    
  } catch (error) {
    console.error('Format operation failed:', error);
    toast.error(`Failed to format code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create a CodeMirror extension for formatting
export const createFormatterExtension = (language?: string) => {
  return EditorView.domEventHandlers({
    keydown(event, view) {
      // Format on Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux) - like VS Code
      if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key === 'F') {
        event.preventDefault();
        formatSelection(view, language);
        return true;
      }
      return false;
    }
  });
};

// Command for manual formatting
export const formatCommand = (language?: string) => {
  return (view: EditorView): boolean => {
    formatSelection(view, language);
    return true;
  };
};

// Helper to detect and format code blocks in markdown
export const formatMarkdownCodeBlocks = async (content: string): Promise<string> => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let formattedContent = content;
  const matches = [...content.matchAll(codeBlockRegex)];
  
  for (const match of matches) {
    const [fullMatch, language, code] = match;
    if (code && code.trim()) {
      try {
        const formattedCode = await formatCode(code, language);
        formattedContent = formattedContent.replace(
          fullMatch, 
          `\`\`\`${language || ''}\n${formattedCode.trim()}\n\`\`\``
        );
      } catch (error) {
        console.warn(`Failed to format code block in ${language}:`, error);
        // Keep original code block if formatting fails
      }
    }
  }
  
  return formattedContent;
}; 