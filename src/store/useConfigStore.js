import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_EXCLUDED_PATTERNS } from '../utils/constants';

const useConfigStore = create(
  persist(
    (set) => ({
      maxLengthEnabled: false,
      maxLength: 4000,
      excludedPatterns: [...DEFAULT_EXCLUDED_PATTERNS],
      promptPrefix: '',
      promptSuffix: '',

      setMaxLengthEnabled: (enabled) => set({ maxLengthEnabled: enabled }),
      setMaxLength: (value) => set({ maxLength: value }),
      addPattern: (pattern) =>
        set((state) => ({
          excludedPatterns: [...state.excludedPatterns, pattern],
        })),
      removePattern: (pattern) =>
        set((state) => ({
          excludedPatterns: state.excludedPatterns.filter((p) => p !== pattern),
        })),
      resetPatterns: () => set({ excludedPatterns: [...DEFAULT_EXCLUDED_PATTERNS] }),
      setPromptPrefix: (text) => set({ promptPrefix: text }),
      setPromptSuffix: (text) => set({ promptSuffix: text }),
    }),
    {
      name: 'contextforge-config',
    }
  )
);

export default useConfigStore;
