export type BlockType = 'text' | 'styled' | 'list' | 'orderedlist' | 'table' | 'chart' | 'image' | 'pdf' | 'code';

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
    chartType?: string;
    data?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };
}

export interface PdfBlock extends BaseBlock {
  type: 'pdf';
  content: {
    src: string | null;
    name?: string;
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  content: {
    code: string;
    language: string;
  };
}

export type Block = TextBlock | StyledTextBlock | ListBlock | OrderedListBlock | TableBlock | ImageBlock | ChartBlock | PdfBlock | CodeBlock; 