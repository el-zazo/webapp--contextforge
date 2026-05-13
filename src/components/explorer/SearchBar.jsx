import React from 'react';
import { Search, X } from 'lucide-react';
import useFileStore from '../../store/useFileStore';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useFileStore();

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search files and folders..."
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm bg-bg-surface2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-150"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
