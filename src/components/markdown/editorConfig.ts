import { EditorView } from '@codemirror/view';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';

// Export language extensions for use in formatter
export { javascript, css, json };

// Custom LaTeX autocompletion
// Don't touch the whole latexCompletions function.
export const latexCompletions = (context: CompletionContext): CompletionResult | null => {
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

export const htmlCompletions = (context: CompletionContext): CompletionResult | null => {
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

export const arrowInput = EditorView.inputHandler.of((view, from, to, text) => {
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