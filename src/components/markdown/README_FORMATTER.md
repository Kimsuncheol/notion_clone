<!-- # CodeMirror Code Formatter Extension

This implementation adds comprehensive code formatting capabilities to the CodeMirror editor in your Notion-like app.

## Features

### 1. Multi-Language Support
- **HTML**: Pretty formatting with proper indentation and attribute alignment
- **CSS**: Property sorting and consistent spacing
- **JavaScript/TypeScript**: Modern ES6+ syntax formatting
- **JSON**: Proper structure and indentation
- **Markdown**: Code block detection and formatting

### 2. Intelligent Language Detection
The formatter automatically detects the language based on content patterns:
```javascript
// JavaScript detection
function detectLanguage(content) {
  // Looks for keywords like 'function', '=>', 'const', etc.
}
```

### 3. Formatting Options

#### Keyboard Shortcuts
- **Primary**: `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux) - same as VS Code
- **Manual**: Format button in the utility bar

#### Selection-Based Formatting
- **No Selection**: Formats the entire document
- **With Selection**: Formats only the selected text
- **Markdown Code Blocks**: Automatically detects and formats code within \`\`\` blocks

### 4. Fallback Mechanism
If Prettier formatting fails (unsupported language or syntax errors), the formatter falls back to basic indentation:
- Automatic bracket/tag-based indentation
- Consistent spacing
- Proper nesting structure

## Usage Examples

### HTML Formatting
**Before:**
```html
<div><p>Hello</p><span style="color:red;">World</span></div>
```

**After:**
```html
<div>
  <p>Hello</p>
  <span style="color: red;">World</span>
</div>
```

### CSS Formatting
**Before:**
```css
.container{margin:0;padding:10px;background-color:#fff;}
```

**After:**
```css
.container {
  margin: 0;
  padding: 10px;
  background-color: #fff;
}
``` -->

### JavaScript Formatting
**Before:**
```javascript
const func=(a,b)=>{return a+b;}
```

**After:**
```javascript
const func = (a, b) => {
  return a + b;
};
```

### Markdown Code Block Formatting
The formatter can detect and format code blocks within markdown:

**Before:**
````markdown
```javascript
const x={a:1,b:2};console.log(x);
```
````

**After:**
````markdown
```javascript
const x = { a: 1, b: 2 };
console.log(x);
```
````

## Integration Details

### 1. File Structure
```
src/components/markdown/
├── codeFormatter.ts          # Core formatting logic
├── MarkdownEditPane.tsx      # Integration with CodeMirror
├── MarkdownUtilityBar.tsx    # Format button UI
└── editorConfig.ts          # Existing editor configuration
```

### 2. Dependencies Added
```json
{
  "prettier": "latest",
  "@codemirror/lang-css": "latest",
  "@codemirror/lang-javascript": "latest", 
  "@codemirror/lang-json": "latest",
  "@codemirror/lang-sql": "latest"
}
```

### 3. CodeMirror Extension
The formatter is implemented as a proper CodeMirror extension:
```typescript
export const createFormatterExtension = (language?: string) => {
  return EditorView.domEventHandlers({
    keydown(event, view) {
      if (event.shiftKey && event.altKey && event.key === 'F') {
        event.preventDefault();
        formatSelection(view, language);
        return true;
      }
      return false;
    }
  });
};
```

## Configuration

### Prettier Configuration
The formatter uses sensible defaults but can be customized:

```typescript
const baseConfig = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
};
```

### Language-Specific Settings
Each language has tailored configuration:
- **HTML**: CSS-sensitive whitespace handling
- **CSS**: Property sorting and consistent formatting
- **JavaScript**: Modern syntax support with Babel parser
- **Markdown**: Preserve prose wrapping

## Error Handling

The formatter includes robust error handling:

1. **Prettier Errors**: Falls back to basic indentation
2. **Invalid Syntax**: Provides helpful error messages
3. **Unsupported Languages**: Uses basic formatting rules
4. **Empty Content**: Shows appropriate user feedback

## Performance Considerations

- **Lazy Loading**: Prettier parsers are loaded on demand
- **Selection-Based**: Only formats selected content when possible
- **Async Processing**: Non-blocking formatting operations
- **Memory Efficient**: Minimal impact on editor performance

## Future Enhancements

Potential improvements for the formatter:

1. **Language Mode Detection**: Automatic language switching based on file context
2. **Custom Rules**: User-configurable formatting preferences
3. **Format on Save**: Automatic formatting when saving
4. **Batch Processing**: Format multiple code blocks simultaneously
5. **Syntax Validation**: Real-time syntax checking with formatting

## Troubleshooting

### Common Issues

**Q: Formatting doesn't work for my code**
A: Check if the language is supported. The formatter supports HTML, CSS, JavaScript, JSON, and Markdown with fallback to basic indentation.

**Q: Keyboard shortcut conflicts**
A: The `Cmd+Shift+P` shortcut is the same as VS Code's command palette. If conflicts occur, use the format button in the utility bar.

**Q: Formatting changes my code structure**
A: Prettier may reorganize code for consistency. This is normal and follows industry standards.

**Q: Performance issues with large files**
A: Format selections instead of entire documents for better performance with large files.

This implementation provides a professional-grade code formatting experience integrated seamlessly with your existing CodeMirror setup. 