export type BlockType = 'text' | 'styled' | 'list' | 'table' | 'chart' | 'image' | 'pdf';

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

export type OtherBlockType = Exclude<BlockType, 'text' | 'styled'>;

export interface ComponentBlock extends BaseBlock {
  type: OtherBlockType;
}

export type Block = TextBlock | ComponentBlock | StyledTextBlock; 