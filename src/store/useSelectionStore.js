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

  addFiles: (fileIds) =>
    set((state) => {
      const existing = new Set(state.selectedFiles);
      const newIds = fileIds.filter((id) => !existing.has(id));
      if (newIds.length === 0) return state;
      return { selectedFiles: [...state.selectedFiles, ...newIds] };
    }),

  removeFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
    })),

  clearSelection: () => set({ selectedFiles: [] }),

  setGeneratedMessages: (messages) => set({ generatedMessages: messages }),
}));

export default useSelectionStore;
