export type BlockType = 'text' | 'styled' | 'list' | 'orderedlist' | 'table' | 'chart' | 'image' | 'code' | 'latex';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface StyledTextBlock extends BaseBlock {
  type: 'styled';
  className: string;
  content: string;
}

export interface ListItem {
  text: string;
  level: number;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  content: ListItem[];
}

export interface OrderedListItem extends ListItem {
  numberType?: '1' | 'A' | 'a' | 'I' | 'i';
}

export interface OrderedListBlock extends BaseBlock {
  type: 'orderedlist';
  content: OrderedListItem[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  content: {
    cells: { [key: string]: string }; // e.g., "0,0": "cell value", "0,1": "another value"
    rows: number;
    cols: number;
    columnWidths?: number[];
    rowHeights?: number[];
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: {
    src: string | null;
    alt?: string;
  };
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  content: {
    chartType: string;
    data?: {
      labels?: string[];
      values?: number[];
      series?: Array<{ data: number[]; label?: string }>;
      xData?: number[];
      yData?: number[];
    };
    config?: {
      width?: number;
      height?: number;
      title?: string;
    };
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  content: {
    code: string;
    language: string;
  };
}

export interface LaTeXBlock extends BaseBlock {
  type: 'latex';
  content: {
    latex: string;
    displayMode?: boolean; // true for display math, false for inline math
  };
}

export type Block = TextBlock | StyledTextBlock | ListBlock | OrderedListBlock | TableBlock | ImageBlock | ChartBlock | CodeBlock | LaTeXBlock; 