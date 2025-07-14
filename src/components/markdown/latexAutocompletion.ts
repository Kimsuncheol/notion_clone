import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { LATEX_COMMANDS, isLatexExpression } from './latexExtension';

// LaTeX command categories for better organization
const LATEX_CATEGORIES = {
  greek: {
    label: 'Greek Letters',
    commands: [
      '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\zeta', '\\eta', '\\theta',
      '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma',
      '\\tau', '\\upsilon', '\\phi', '\\chi', '\\psi', '\\omega',
      '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Upsilon',
      '\\Phi', '\\Psi', '\\Omega'
    ]
  },
  functions: {
    label: 'Functions',
    commands: [
      '\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc',
      '\\sinh', '\\cosh', '\\tanh', '\\coth',
      '\\log', '\\ln', '\\exp', '\\arg', '\\det',
      '\\lim', '\\sup', '\\inf', '\\max', '\\min'
    ]
  },
  operators: {
    label: 'Operators',
    commands: [
      '\\sum', '\\prod', '\\int', '\\oint', '\\bigcup', '\\bigcap',
      '\\frac', '\\sqrt', '\\partial', '\\nabla'
    ]
  },
  relations: {
    label: 'Relations',
    commands: [
      '\\leq', '\\geq', '\\equiv', '\\neq', '\\approx', '\\sim', '\\simeq',
      '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\in', '\\ni', '\\notin'
    ]
  },
  arrows: {
    label: 'Arrows',
    commands: [
      '\\leftarrow', '\\rightarrow', '\\leftrightarrow', '\\uparrow', '\\downarrow',
      '\\Leftarrow', '\\Rightarrow', '\\Leftrightarrow', '\\mapsto'
    ]
  },
  symbols: {
    label: 'Symbols',
    commands: [
      '\\infty', '\\emptyset', '\\forall', '\\exists', '\\nexists',
      '\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\circ'
    ]
  }
};

// Common LaTeX templates with placeholders
const LATEX_TEMPLATES: Completion[] = [
  {
    label: '\\frac{numerator}{denominator}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\frac{|}{}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 6 } // Position cursor after first {
      });
    },
    type: 'function',
    info: 'Fraction template'
  },
  {
    label: '\\sqrt{expression}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\sqrt{|}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 6 } // Position cursor inside {}
      });
    },
    type: 'function',
    info: 'Square root template'
  },
  {
    label: '\\sum_{i=1}^{n}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\sum_{|}^{}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 6 } // Position cursor after _{
      });
    },
    type: 'function',
    info: 'Summation with limits'
  },
  {
    label: '\\int_{a}^{b}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\int_{|}^{}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 6 } // Position cursor after _{
      });
    },
    type: 'function',
    info: 'Definite integral'
  },
  {
    label: 'x^{exponent}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '^{|}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 2 } // Position cursor inside {}
      });
    },
    type: 'keyword',
    info: 'Superscript template'
  },
  {
    label: 'x_{subscript}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '_{|}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 2 } // Position cursor inside {}
      });
    },
    type: 'keyword',
    info: 'Subscript template'
  },
  {
    label: '\\begin{matrix}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\begin{matrix}\n|\n\\end{matrix}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 15 } // Position cursor in matrix content
      });
    },
    type: 'keyword',
    info: 'Matrix environment'
  },
  {
    label: '\\begin{cases}',
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      const template = '\\begin{cases}\n| & \\text{if } \\\\\n & \\text{otherwise}\n\\end{cases}';
      view.dispatch({
        changes: { from, to, insert: template },
        selection: { anchor: from + 14 } // Position cursor at first case
      });
    },
    type: 'keyword',
    info: 'Piecewise function'
  }
];

// Create completions from LaTeX commands
const createLatexCompletions = (commands: string[], category?: string): Completion[] => {
  return commands.map(command => ({
    label: command,
    type: 'keyword',
    info: category ? `${category}: ${command}` : `LaTeX command: ${command}`,
    apply: (view: EditorView, completion: Completion, from: number, to: number) => {
      view.dispatch({
        changes: { from, to, insert: command },
        selection: { anchor: from + command.length }
      });
    }
  }));
};

// Check if we're inside a LaTeX expression
const isInLatexContext = (context: CompletionContext): { inLatex: boolean; isBlock: boolean } => {
  const { state, pos } = context;
  const text = state.doc.toString();
  const latexInfo = isLatexExpression(text, pos);
  
  return {
    inLatex: latexInfo.isLatex,
    isBlock: latexInfo.isBlock
  };
};

// Get LaTeX completions based on context
export const latexCompletions = (context: CompletionContext): CompletionResult | null => {
  const { inLatex } = isInLatexContext(context);
  
  // Only provide LaTeX completions inside LaTeX expressions
  if (!inLatex) {
    return null;
  }

  const word = context.matchBefore(/\\[a-zA-Z]*|[a-zA-Z_^{}]*|\^|\_{/);
  if (!word) return null;

  const completions: Completion[] = [];

  // Add templates first (higher priority)
  if (word.text.length > 0) {
    completions.push(...LATEX_TEMPLATES.filter(template => 
      template.label.toLowerCase().includes(word.text.toLowerCase())
    ));
  }

  // Add categorized commands
  Object.values(LATEX_CATEGORIES).forEach(category => {
    const filtered = category.commands.filter(command =>
      command.toLowerCase().includes(word.text.toLowerCase())
    );
    completions.push(...createLatexCompletions(filtered, category.label));
  });

  // Add remaining commands not in categories
  const categorizedCommands = new Set(
    Object.values(LATEX_CATEGORIES).flatMap(cat => cat.commands)
  );
  const remainingCommands = LATEX_COMMANDS.filter(cmd => 
    !categorizedCommands.has(cmd) && 
    cmd.toLowerCase().includes(word.text.toLowerCase())
  );
  completions.push(...createLatexCompletions(remainingCommands));

  // Sort by relevance (exact matches first, then by length)
  completions.sort((a, b) => {
    const aExact = a.label.toLowerCase() === word.text.toLowerCase();
    const bExact = b.label.toLowerCase() === word.text.toLowerCase();
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.label.length - b.label.length;
  });

  return {
    from: word.from,
    options: completions.slice(0, 50) // Limit to 50 suggestions for performance
  };
};

// Helper function to insert common LaTeX structures
export const insertLatexStructure = (view: EditorView, structure: string, cursorOffset: number = 0) => {
  const { state } = view;
  const { from, to } = state.selection.main;
  
  view.dispatch({
    changes: { from, to, insert: structure },
    selection: { anchor: from + cursorOffset }
  });
  
  view.focus();
};

// Predefined LaTeX structures for quick insertion
export const LATEX_STRUCTURES = {
  inlineMath: { text: '$|$', cursorOffset: 1 },
  blockMath: { text: '$$\n|\n$$', cursorOffset: 3 },
  fraction: { text: '\\frac{|}{#}', cursorOffset: 6 },
  sqrt: { text: '\\sqrt{|}', cursorOffset: 6 },
  sum: { text: '\\sum_{|}^{#}', cursorOffset: 6 },
  integral: { text: '\\int_{|}^{#}', cursorOffset: 6 },
  matrix: { text: '\\begin{matrix}\n|\n\\end{matrix}', cursorOffset: 15 },
  cases: { text: '\\begin{cases}\n| & \\text{if } \\\\\n# & \\text{otherwise}\n\\end{cases}', cursorOffset: 14 }
}; 