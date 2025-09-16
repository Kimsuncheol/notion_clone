export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'quality' | 'reasoning';
  provider: string;
  isLimited?: boolean;
  isNew?: boolean;
}

export const aiModels: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'Speed',
    description: 'Snappy responses with impressive capabilities.',
    category: 'speed',
    provider: 'OpenAI GPT-4o-mini'
  },
  {
    id: 'gpt-4.1',
    name: 'Quality',
    description: 'High quality for complex tasks.',
    category: 'quality',
    provider: 'OpenAI GPT-4.1',
    isLimited: true,
    isNew: true
  },
  {
    id: 'claude-sonnet',
    name: 'Quality',
    description: 'High quality with understanding.',
    category: 'quality',
    provider: 'Anthropic/Claude 3.7 Sonnet',
    isLimited: true
  },
  {
    id: 'o3-mini',
    name: 'Reasoning',
    description: 'Strong reasoning and problem-solving.',
    category: 'reasoning',
    provider: 'OpenAI o3-mini',
    isLimited: true
  }
];