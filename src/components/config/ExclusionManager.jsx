import React, { useState } from 'react';
import { X, Plus, RotateCcw } from 'lucide-react';
import useConfigStore from '../../store/useConfigStore';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function ExclusionManager() {
  const { excludedPatterns, addPattern, removePattern, resetPatterns } = useConfigStore();
  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);

  function handleAdd() {
    const trimmed = newPattern.trim();

    if (!trimmed) {
      setError('Pattern cannot be empty');
      return;
    }
    if (trimmed.includes(' ')) {
      setError('Pattern cannot contain spaces');
      return;
    }
    if (excludedPatterns.includes(trimmed)) {
      setError('Pattern already exists in the list');
      return;
    }

    addPattern(trimmed);
    setNewPattern('');
    setError('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleRemoveClick(pattern) {
    setPatternToDelete(pattern);
    setShowDeleteDialog(true);
  }

  function confirmRemove() {
    if (patternToDelete) {
      removePattern(patternToDelete);
    }
    setShowDeleteDialog(false);
    setPatternToDelete(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Excluded Patterns
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Files and folders matching these patterns will be shown in the tree but disabled (no actions, reduced opacity).
        </p>
      </div>

      {/* Pattern tags */}
      <div className="flex flex-wrap gap-2">
        {excludedPatterns.map((pattern) => (
          <span
            key={pattern}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface2 border border-border rounded-full text-sm text-text-primary group"
          >
            <span className="font-mono text-xs">{pattern}</span>
            <button
              onClick={() => handleRemoveClick(pattern)}
              className="ml-0.5 text-text-muted hover:text-danger transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Add pattern input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPattern}
          onChange={(e) => {
            setNewPattern(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. *.min.js, coverage/"
          className={`
            flex-1 px-3 py-2 rounded-lg text-sm font-mono
            bg-bg-surface2 border border-border
            text-text-primary placeholder-text-muted
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
            transition-all duration-150
          `}
        />
        <Button onClick={handleAdd} size="md" className="flex-shrink-0">
          <Plus size={16} />
          Add
        </Button>
      </div>

      {error && (
        <p className="text-danger text-xs">{error}</p>
      )}

      {/* Reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowResetDialog(true)}
      >
        <RotateCcw size={14} />
        Reset to Defaults
      </Button>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Remove Pattern"
        message={`Are you sure you want to remove the pattern "${patternToDelete}"?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={confirmRemove}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPatternToDelete(null);
        }}
      />

      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Patterns"
        message="This will restore the default exclusion patterns list. Any custom patterns you've added will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={() => {
          resetPatterns();
          setShowResetDialog(false);
        }}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}
