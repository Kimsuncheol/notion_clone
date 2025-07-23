export interface HTMLTag {
    name: string;
    tag: string;
    icon: string;
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