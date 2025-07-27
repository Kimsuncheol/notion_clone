import { Components } from 'react-markdown';
import React from 'react';
import { defaultSchema } from 'rehype-sanitize';
import { HTMLTag, LatexStructure } from './interface';


export const components: Components = {
    // Custom components for better styling
    h1: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h1 className="text-gray-700 text-4xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h1>
    ),
    h2: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h2 className="text-gray-700 text-3xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h2>
    ),
    h3: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h3 className="text-gray-700 text-2xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h3>
    ),
    h4: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h4 className="text-gray-700 text-xl font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h4>
    ),
    h5: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h5 className="text-gray-700 text-lg font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h5>
    ),
    h6: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <h6 className="text-gray-700 text-base font-bold dark:text-gray-300 leading-relaxed" style={style}>{children}</h6>
    ),
    p: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</p>
    ),
    b: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <b className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</b>
    ),
    i: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <i className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</i>
    ),
    u: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <u className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</u>
    ),
    s: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <s className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</s>
    ),
    sup: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <sup className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</sup>
    ),
    sub: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <sub className="text-gray-700 dark:text-gray-300 leading-relaxed" style={style}>{children}</sub>
    ),
    br: ({ style }: { style?: React.CSSProperties }) => (
      <br style={style} />
    ),
    hr: ({ style }: { style?: React.CSSProperties }) => (
      <hr className="my-4 border-gray-200 dark:border-gray-700" style={style} />
    ),
    code: (props: React.ComponentProps<'code'> & { inline?: boolean }) => {
      const { inline, children, style, ...rest } = props;
      return inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" style={style} {...rest} >
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-line" style={style} {...rest}>
          {children}
        </code>
      );
    },
    blockquote: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 my-4" style={style}>
        {children}
      </blockquote>
    ),
    ul: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1" style={style}>{children}</ul>
    ),
    ol: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1" style={style}>{children}</ol>
    ),
    li: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <li className="text-gray-700 dark:text-gray-300" style={style}>{children}</li>
    ),
    table: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-auto border border-collapse border-gray-200 dark:border-gray-700" style={style}>
          {children}
        </table>
      </div>
    ),
    tr: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <tr className="border border-collapse border-gray-200 dark:border-gray-700" style={style}>{children}</tr>
    ),
    th: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <th className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left" style={style}>
        {children}
      </th>
    ),
    td: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
      <td className="border border-collapse border-gray-200 dark:border-gray-700 px-4 py-2" style={style}>
        {children}
      </td>
    ),
    img: ({ src, alt, style, ...props }: React.ComponentProps<'img'> & { src: string; alt: string }) => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={alt}
        style={style}
        className="max-w-full h-auto rounded-lg shadow-sm my-4"
        {...props}
      />
    ),
    a: ({ children, href, style }: React.ComponentProps<'a'> & { href: string }) => (
      <a
        href={href}
        style={style}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  } as Components & string;

  // Simplified sanitize schema - less restrictive for KaTeX
export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': ['className', 'style'], // Allow className and style on all elements
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
    annotation: ['encoding'],
    math: ['xmlns', 'display'],
    semantics: [],
    // Allow all MathML attributes
    mi: ['mathvariant'],
    mn: [],
    mo: ['stretchy', 'fence', 'separator', 'lspace', 'rspace'],
    mrow: [],
    msup: [],
    msub: [],
    mfrac: ['linethickness'],
    msqrt: [],
    mroot: [],
    mtable: ['columnalign', 'rowspacing', 'columnspacing'],
    mtr: [],
    mtd: ['columnspan', 'rowspan'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // KaTeX generates these elements
    'math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mspace',
    'mover', 'munder', 'munderover', 'msup', 'msub', 'msubsup', 'mfrac',
    'mroot', 'msqrt', 'mtable', 'mtr', 'mtd', 'mlongdiv', 'mscarries',
    'mscarry', 'msgroup', 'msline', 'msrow', 'mstack', 'mrow'
  ]
};

export const htmlTags: HTMLTag[] = [
  { name: 'Bold', tag: 'strong', icon: 'B', description: 'Bold text' },
  { name: 'Italic', tag: 'em', icon: 'I', description: 'Italic text' },
  { name: 'Underline', tag: 'u', icon: 'U', description: 'Underlined text' },
  { name: 'Code', tag: 'code', icon: '</>', description: 'Inline code' },
  { name: 'Link', tag: 'a href=""', icon: '🔗', description: 'Hyperlink' },
  { name: 'Heading 1', tag: 'h1', icon: "H1", description: 'Heading level 1' },
  { name: 'Heading 2', tag: 'h2', icon: "H2", description: 'Heading level 2' },  // Don't touch this
  { name: 'Heading 3', tag: 'h3', icon: "H3", description: 'Heading level 3' },
  { name: 'Heading 4', tag: 'h4', icon: "H4", description: 'Heading level 4' },
  { name: 'Blockquote', tag: 'blockquote', icon: '❝', description: 'Block quote' },
];

export const latexStructures: LatexStructure[] = [
  { name: 'Inline Math', expression: '${|}$', icon: '$', description: 'Inline math expression', cursorOffset:2 },
  { name: 'Block Math', expression: '$${|}$$', icon: '$$', description: 'Block math expression', isBlock: true, cursorOffset: 3 },
  { name: 'Fraction', expression: '$$\\frac{|}{|}$$', icon: '½', description: 'Fraction (\\frac)', cursorOffset: 8 },
  { name: 'Square Root', expression: '$$\\sqrt{|} $$', icon: '√', description: 'Square root (\\sqrt)', cursorOffset: 8 },
  { name: 'Summation', expression: '$$\\sum_{|}^{|}$$', icon: 'Σ', description: 'Summation with limits', cursorOffset: 8 },
  { name: 'Integral', expression: '$$\\int_{|}^{|}$$', icon: '∫', description: 'Integral with limits', cursorOffset: 8 },
  { name: 'Superscript', expression: '$$\\^{|}$$', icon: 'xⁿ', description: 'Superscript', cursorOffset: 5 },
  { name: 'Subscript', expression: '$$\\_{|}$$', icon: 'xₙ', description: 'Subscript', cursorOffset: 5 },
];