import { create } from 'zustand';

const useFileStore = create((set) => ({
  rootName: '',
  files: [],
  searchQuery: '',
  activeExtensions: [],
  sortBy: 'name-asc',

  setRootName: (name) => set({ rootName: name }),
  setFiles: (files) => set({ files }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveExtensions: (exts) => set({ activeExtensions: exts }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFiles: () => set({ files: [], rootName: '', searchQuery: '', activeExtensions: [], sortBy: 'name-asc' }),
}));

export default useFileStore;
