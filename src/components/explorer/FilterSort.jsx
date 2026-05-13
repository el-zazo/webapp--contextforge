import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, ArrowUpDown, X } from 'lucide-react';
import useFileStore from '../../store/useFileStore';
import { getUniqueExtensions } from '../../utils/fileUtils';

export default function FilterSort() {
  const { files, activeExtensions, setActiveExtensions, sortBy, setSortBy } = useFileStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const extensions = getUniqueExtensions(files);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleExtension(ext) {
    if (activeExtensions.includes(ext)) {
      setActiveExtensions(activeExtensions.filter((e) => e !== ext));
    } else {
      setActiveExtensions([...activeExtensions, ext]);
    }
  }

  function clearFilters() {
    setActiveExtensions([]);
  }

  const sortOptions = [
    { value: 'name-asc', label: 'Name A → Z' },
    { value: 'name-desc', label: 'Name Z → A' },
    { value: 'size-asc', label: 'Size ↑' },
    { value: 'size-desc', label: 'Size ↓' },
    { value: 'ext-asc', label: 'Extension A → Z' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Extension filter */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => {
            setFilterOpen(!filterOpen);
            setSortOpen(false);
          }}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-150 cursor-pointer border
            ${activeExtensions.length > 0
              ? 'bg-accent-muted text-accent border-accent/30'
              : 'bg-bg-surface2 text-text-secondary border-border hover:bg-border'
            }
          `}
        >
          <Filter size={12} />
          Extensions
          {activeExtensions.length > 0 && (
            <span className="ml-1 w-4 h-4 flex items-center justify-center bg-accent text-white text-[10px] rounded-full">
              {activeExtensions.length}
            </span>
          )}
        </button>

        {filterOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-bg-surface border border-border rounded-lg shadow-xl z-20 p-3 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">Filter by extension</span>
              {activeExtensions.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extensions.map((ext) => (
                <button
                  key={ext}
                  onClick={() => toggleExtension(ext)}
                  className={`
                    px-2 py-1 rounded text-xs font-mono transition-all duration-150 cursor-pointer border
                    ${activeExtensions.includes(ext)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-bg-surface2 text-text-secondary border-border hover:border-accent/50'
                    }
                  `}
                >
                  {ext}
                </button>
              ))}
              {extensions.length === 0 && (
                <span className="text-xs text-text-muted">No extensions found</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => {
            setSortOpen(!sortOpen);
            setFilterOpen(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-surface2 text-text-secondary border border-border hover:bg-border transition-all duration-150 cursor-pointer"
        >
          <ArrowUpDown size={12} />
          Sort
          <ChevronDown size={12} />
        </button>

        {sortOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-bg-surface border border-border rounded-lg shadow-xl z-20 py-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSortBy(opt.value);
                  setSortOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer
                  ${sortBy === opt.value
                    ? 'bg-accent-muted text-accent'
                    : 'text-text-secondary hover:bg-bg-surface2'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active extension tags */}
      {activeExtensions.map((ext) => (
        <span
          key={ext}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono bg-accent-muted text-accent border border-accent/30"
        >
          {ext}
          <button
            onClick={() => toggleExtension(ext)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}
