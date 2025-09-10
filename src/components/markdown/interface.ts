export interface MarkdownTag {
    name: string;
    tag?: string;
    tagMarkdown?: string;
    icon: string | React.ReactNode;
    description: string;
    isSelfClosing?: boolean;
  }
  
  export interface LatexStructure {
    name: string;
    expression: string;
    icon: string;
    description: string;
    isBlock?: boolean;
    cursorOffset?: number;
  }