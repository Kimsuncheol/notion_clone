import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// LaTeX syntax highlighting style
const latexHighlightStyle = HighlightStyle.define([
  {
    tag: tags.special(tags.string),
    color: '#d73a49' // Red for LaTeX delimiters
  },
  {
    tag: tags.regexp,
    color: '#032f62' // Blue for LaTeX commands
  },
  {
    tag: tags.keyword,
    color: '#6f42c1' // Purple for LaTeX keywords
  },
  {
    tag: tags.variableName,
    color: '#22863a' // Green for variables
  }
]);

// LaTeX expression detection regex
const INLINE_LATEX_REGEX = /\$[^$\n]+\$/g;
const BLOCK_LATEX_REGEX = /\$\$[\s\S]*?\$\$/g;

// LaTeX commands for autocompletion
export const LATEX_COMMANDS = [
  // Basic math
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta', '\\theta',
  '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma',
  '\\tau', '\\upsilon', '\\phi', '\\chi', '\\psi', '\\omega',
  '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Upsilon',
  '\\Phi', '\\Psi', '\\Omega',
  
  // Operations
  '\\sum', '\\prod', '\\int', '\\oint', '\\lim', '\\inf', '\\sup', '\\max', '\\min',
  '\\arg', '\\det', '\\exp', '\\ln', '\\log', '\\sin', '\\cos', '\\tan', '\\cot',
  '\\sec', '\\csc', '\\sinh', '\\cosh', '\\tanh', '\\coth',
  
  // Symbols
  '\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\ast', '\\star', '\\dagger',
  '\\ddagger', '\\amalg', '\\cap', '\\cup', '\\uplus', '\\sqcap', '\\sqcup',
  '\\vee', '\\wedge', '\\oplus', '\\ominus', '\\otimes', '\\oslash', '\\odot',
  '\\circ', '\\bullet', '\\diamond', '\\lhd', '\\rhd', '\\unlhd', '\\unrhd',
  '\\bigtriangleup', '\\bigtriangledown', '\\triangleleft', '\\triangleright',
  
  // Relations
  '\\leq', '\\geq', '\\equiv', '\\models', '\\prec', '\\succ', '\\sim', '\\perp',
  '\\preceq', '\\succeq', '\\simeq', '\\mid', '\\ll', '\\gg', '\\asymp', '\\parallel',
  '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\sqsubset', '\\sqsupset',
  '\\sqsubseteq', '\\sqsupseteq', '\\in', '\\ni', '\\propto', '\\vdash', '\\dashv',
  
  // Arrows
  '\\leftarrow', '\\rightarrow', '\\uparrow', '\\downarrow', '\\leftrightarrow',
  '\\updownarrow', '\\Leftarrow', '\\Rightarrow', '\\Uparrow', '\\Downarrow',
  '\\Leftrightarrow', '\\Updownarrow', '\\mapsto', '\\longmapsto', '\\hookleftarrow',
  '\\hookrightarrow', '\\leftharpoonup', '\\leftharpoondown', '\\rightharpoonup',
  '\\rightharpoondown', '\\rightleftharpoons', '\\leadsto',
  
  // Functions and structures
  '\\frac', '\\sqrt', '\\overline', '\\underline', '\\overbrace', '\\underbrace',
  '\\overrightarrow', '\\overleftarrow', '\\hat', '\\check', '\\breve', '\\acute',
  '\\grave', '\\tilde', '\\bar', '\\vec', '\\dot', '\\ddot',
  
  // Spacing
  '\\quad', '\\qquad', '\\,', '\\:', '\\;', '\\!', '\\enspace', '\\thinspace',
  '\\medspace', '\\thickspace', '\\negthinspace', '\\negmedspace', '\\negthickspace',
  
  // Delimiters
  '\\left(', '\\right)', '\\left[', '\\right]', '\\left\\{', '\\right\\}',
  '\\left|', '\\right|', '\\left\\|', '\\right\\|', '\\left\\langle', '\\right\\rangle',
  '\\left\\lceil', '\\right\\rceil', '\\left\\lfloor', '\\right\\rfloor',
  
  // Environments
  '\\begin{matrix}', '\\end{matrix}', '\\begin{pmatrix}', '\\end{pmatrix}',
  '\\begin{bmatrix}', '\\end{bmatrix}', '\\begin{Bmatrix}', '\\end{Bmatrix}',
  '\\begin{vmatrix}', '\\end{vmatrix}', '\\begin{Vmatrix}', '\\end{Vmatrix}',
  '\\begin{array}', '\\end{array}', '\\begin{align}', '\\end{align}',
  '\\begin{aligned}', '\\end{aligned}', '\\begin{cases}', '\\end{cases}',
  
  // Special
  '\\infty', '\\partial', '\\nabla', '\\forall', '\\exists', '\\nexists',
  '\\emptyset', '\\varnothing', '\\Re', '\\Im', '\\aleph', '\\hbar', '\\ell',
  '\\wp', '\\angle', '\\top', '\\bot', '\\vdots', '\\ddots', '\\cdots', '\\ldots',
];

// LaTeX highlighting plugin
const latexHighlighting = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: Array<any> = [];
    const doc = view.state.doc;
    const text = doc.toString();

    // Find inline LaTeX expressions
    let match;
    INLINE_LATEX_REGEX.lastIndex = 0;
    while ((match = INLINE_LATEX_REGEX.exec(text)) !== null) {
      const from = match.index;
      const to = match.index + match[0].length;
      builder.push(Decoration.mark({
        class: 'cm-latex-inline'
      }).range(from, to));
    }

    // Find block LaTeX expressions
    BLOCK_LATEX_REGEX.lastIndex = 0;
    while ((match = BLOCK_LATEX_REGEX.exec(text)) !== null) {
      const from = match.index;
      const to = match.index + match[0].length;
      builder.push(Decoration.mark({
        class: 'cm-latex-block'
      }).range(from, to));
    }

    return Decoration.set(builder.sort((a, b) => a.from - b.from));
  }
}, {
  decorations: v => v.decorations
});

// LaTeX CSS theme
const latexTheme = EditorView.theme({
  '.cm-latex-inline': {
    backgroundColor: '#f0f8ff',
    border: '1px solid #87ceeb',
    borderRadius: '2px',
    padding: '1px 2px',
    fontFamily: 'KaTeX_Main, "Times New Roman", serif',
    color: '#000080'
  },
  '.cm-latex-block': {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '4px 8px',
    margin: '4px 0',
    display: 'block',
    fontFamily: 'KaTeX_Main, "Times New Roman", serif',
    color: '#000080'
  }
});

// Dark theme for LaTeX
const latexDarkTheme = EditorView.theme({
  '.cm-latex-inline': {
    backgroundColor: '#1a1a2e',
    border: '1px solid #16213e',
    borderRadius: '2px',
    padding: '1px 2px',
    fontFamily: 'KaTeX_Main, "Times New Roman", serif',
    color: '#87ceeb'
  },
  '.cm-latex-block': {
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    padding: '4px 8px',
    margin: '4px 0',
    display: 'block',
    fontFamily: 'KaTeX_Main, "Times New Roman", serif',
    color: '#87ceeb'
  }
});

// LaTeX helper functions
export const isLatexExpression = (text: string, pos: number): { isLatex: boolean; isBlock: boolean; start: number; end: number } => {
  // Check if position is inside a LaTeX expression
  let match;
  
  // Check inline expressions
  INLINE_LATEX_REGEX.lastIndex = 0;
  while ((match = INLINE_LATEX_REGEX.exec(text)) !== null) {
    if (pos >= match.index && pos <= match.index + match[0].length) {
      return {
        isLatex: true,
        isBlock: false,
        start: match.index,
        end: match.index + match[0].length
      };
    }
  }
  
  // Check block expressions
  BLOCK_LATEX_REGEX.lastIndex = 0;
  while ((match = BLOCK_LATEX_REGEX.exec(text)) !== null) {
    if (pos >= match.index && pos <= match.index + match[0].length) {
      return {
        isLatex: true,
        isBlock: true,
        start: match.index,
        end: match.index + match[0].length
      };
    }
  }
  
  return { isLatex: false, isBlock: false, start: -1, end: -1 };
};

export const insertLatexExpression = (view: EditorView, expression: string, isBlock: boolean = false) => {
  const { state } = view;
  const { from, to } = state.selection.main;
  
  const prefix = isBlock ? '$$' : '$';
  const suffix = isBlock ? '$$' : '$';
  const fullExpression = `${prefix}${expression}${suffix}`;
  
  view.dispatch({
    changes: { from, to, insert: fullExpression },
    selection: { anchor: from + prefix.length + expression.length }
  });
  
  view.focus();
};

// Main LaTeX extension
export const latexExtension = (isDarkMode: boolean = false): Extension => {
  return [
    latexHighlighting,
    isDarkMode ? latexDarkTheme : latexTheme,
    syntaxHighlighting(latexHighlightStyle)
  ];
}; 