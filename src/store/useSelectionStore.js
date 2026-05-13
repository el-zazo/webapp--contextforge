import { create } from 'zustand';

const useSelectionStore = create((set) => ({
  selectedFiles: [],
  generatedMessages: [],

  addFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(fileId)
        ? state.selectedFiles
        : [...state.selectedFiles, fileId],
    })),

  removeFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
    })),

  clearSelection: () => set({ selectedFiles: [] }),

  setGeneratedMessages: (messages) => set({ generatedMessages: messages }),
}));

export default useSelectionStore;
