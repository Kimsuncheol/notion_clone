import { availableThemes } from "@/components/markdown/constants";
import { githubLight } from '@uiw/codemirror-themes-all';

export const getCurrentTheme = (currentTheme: string) => {
  const themeObj = availableThemes.find(theme => theme.value === currentTheme);
  return themeObj?.theme || githubLight;
};