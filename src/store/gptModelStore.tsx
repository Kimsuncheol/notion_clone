import React from 'react';
import { create } from 'zustand';
import { SiGooglegemini, SiAnthropic, SiOpenai } from 'react-icons/si';

export interface GptModel {
  title: string;
  name: string;
  icon: React.ReactElement;
}

const gptModels: GptModel[] = [
  { title: 'Gemini', name: 'models/gemini-2.0-flash-exp', icon: <SiGooglegemini /> },
  { title: 'Claude', name: 'claude-3-5-sonnet-20240620', icon: <SiAnthropic /> },
  { title: 'ChatGPT', name: 'gpt-4o-mini', icon: <SiOpenai /> },
];

interface GptModelStore {
  models: GptModel[];
  selectedModel: GptModel;
  setSelectedModel: (model: GptModel) => void;
}

export const useGptModelStore = create<GptModelStore>((set) => ({
  models: gptModels,
  selectedModel: gptModels[0],
  setSelectedModel: (model) => set({ selectedModel: model }),
}));


