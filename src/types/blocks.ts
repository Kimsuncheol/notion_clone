export type BlockType = 'text' | 'list' | 'table' | 'chart' | 'image' | 'pdf';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export type OtherBlockType = Exclude<BlockType, 'text'>;

export interface ComponentBlock extends BaseBlock {
  type: OtherBlockType;
}

export type Block = TextBlock | ComponentBlock; 