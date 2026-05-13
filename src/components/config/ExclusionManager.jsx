import React, { useState } from 'react';
import {
  X,
  Plus,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import useConfigStore from '../../store/useConfigStore';
import { validatePattern } from '../../utils/fileUtils';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function ExclusionManager() {
  const {
    excludedPatterns,
    addPattern,
    removePattern,
    resetPatterns,
    caseSensitivePatterns,
    setCaseSensitivePatterns,
  } = useConfigStore();

  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  function handleAdd() {
    const validationError = validatePattern(newPattern, excludedPatterns);
    if (validationError) {
      setError(validationError);
      return;
    }
    addPattern(newPattern.trim());
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
    <div className="space-y-5">
      {/* Section title */}
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Excluded Patterns
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Files and folders matching these patterns will be shown in the tree
          but disabled (no actions, reduced opacity).
        </p>
      </div>

      {/* Case-sensitive toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-surface2 rounded-lg border border-border-subtle">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            Case-sensitive matching
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            When enabled, <code className="font-mono text-text-secondary">README.md</code> and{' '}
            <code className="font-mono text-text-secondary">readme.md</code> are treated as
            different files.
          </p>
        </div>
        <button
          onClick={() => setCaseSensitivePatterns(!caseSensitivePatterns)}
          className={`
            relative flex-shrink-0 ml-4 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
            ${caseSensitivePatterns ? 'bg-accent' : 'bg-border border border-border'}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm
              ${caseSensitivePatterns ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Help toggle */}
      <button
        onClick={() => setHelpOpen(!helpOpen)}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
      >
        {helpOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <HelpCircle size={14} />
        <span className="font-medium">Pattern Format Guide</span>
      </button>

      {/* Collapsible help panel */}
      {helpOpen && (
        <div className="bg-bg-surface2 rounded-lg border border-border-subtle p-4 text-xs text-text-secondary leading-relaxed space-y-3">
          {/* Name-only patterns */}
          <div>
            <p className="font-semibold text-text-primary text-sm mb-1.5">
              📄 Name-only patterns
            </p>
            <p className="text-text-muted mb-2">
              No slash, or only trailing slash — matched against filename only.
            </p>
            <div className="space-y-1 font-mono">
              <p>
                <span className="text-accent">folder/</span>{' '}
                <span className="text-text-muted">→ Any folder with this exact name</span>
              </p>
              <p className="text-text-muted pl-4">
                e.g. node_modules/ &nbsp;dist/ &nbsp;.git/
              </p>
              <p>
                <span className="text-accent">filename.ext</span>{' '}
                <span className="text-text-muted">→ Any file with this exact name</span>
              </p>
              <p className="text-text-muted pl-4">
                e.g. .env &nbsp;.env.local &nbsp;Makefile
              </p>
              <p>
                <span className="text-accent">*.ext</span>{' '}
                <span className="text-text-muted">→ Any file with this extension (anywhere)</span>
              </p>
              <p className="text-text-muted pl-4">
                e.g. *.log &nbsp;*.lock &nbsp;*.min.js
              </p>
              <p>
                <span className="text-accent">prefix*</span>{' '}
                <span className="text-text-muted">→ Any file/folder starting with this prefix</span>
              </p>
              <p className="text-text-muted pl-4">
                e.g. debug* &nbsp;temp* &nbsp;.env*
              </p>
            </div>
          </div>

          {/* Separator */}
          <hr className="border-border-subtle" />

          {/* Path-based patterns */}
          <div>
            <p className="font-semibold text-text-primary text-sm mb-1.5">
              📁 Path-based patterns
            </p>
            <p className="text-text-muted mb-2">
              Contains a slash — matched against full path from project root.
            </p>
            <div className="space-y-1 font-mono">
              <p>
                <span className="text-accent">src/auth/routes.js</span>{' '}
                <span className="text-text-muted">→ This exact file only</span>
              </p>
              <p>
                <span className="text-accent">src/auth/routes.*</span>{' '}
                <span className="text-text-muted">→ routes.js, routes.ts, routes.jsx, etc.</span>
              </p>
              <p>
                <span className="text-accent">src/auth/*</span>{' '}
                <span className="text-text-muted">→ Files directly inside src/auth/ (not recursive)</span>
              </p>
              <p>
                <span className="text-accent">src/auth/**</span>{' '}
                <span className="text-text-muted">→ ALL files recursively under src/auth/</span>
              </p>
              <p>
                <span className="text-accent">src/*/routes.js</span>{' '}
                <span className="text-text-muted">→ routes.js one level deep under src/</span>
              </p>
              <p>
                <span className="text-accent">src/**/*.test.js</span>{' '}
                <span className="text-text-muted">→ Any .test.js file anywhere under src/</span>
              </p>
              <p>
                <span className="text-accent">**/docs/README.md</span>{' '}
                <span className="text-text-muted">→ README.md inside any "docs" folder</span>
              </p>
              <p>
                <span className="text-accent">**/*.log</span>{' '}
                <span className="text-text-muted">→ Any .log file anywhere in the project</span>
              </p>
            </div>
          </div>

          {/* Separator */}
          <hr className="border-border-subtle" />

          {/* Tips */}
          <div className="space-y-1">
            <p className="text-text-muted">
              ⚠️ <code className="text-text-secondary">src/auth/</code>,{' '}
              <code className="text-text-secondary">/src/auth/</code> and{' '}
              <code className="text-text-secondary">src/auth</code> are treated the same
              (anchored to root).
            </p>
            <p className="text-text-muted">
              ⚠️ Use <code className="text-text-secondary">**</code> prefix to match
              anywhere: <code className="text-text-secondary">**/auth/</code> matches
              any "auth" folder.
            </p>
            <p className="text-text-muted">
              ⚠️ <code className="text-text-secondary">*</code> matches within one
              folder level only;{' '}
              <code className="text-text-secondary">**</code> matches across multiple
              levels.
            </p>
          </div>

          {/* Separator */}
          <hr className="border-border-subtle" />

          {/* Dynamic case note */}
          <div className="flex items-start gap-2 text-warning">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <p>
                Case-sensitive matching is currently{' '}
                <span className="font-semibold">
                  {caseSensitivePatterns ? 'ON' : 'OFF'}
                </span>.
              </p>
              <p className="text-text-muted mt-0.5">
                {caseSensitivePatterns
                  ? 'When ON: README.md ≠ readme.md'
                  : 'When OFF: README.md = readme.md = Readme.md'}
              </p>
            </div>
          </div>
        </div>
      )}

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
          placeholder='e.g. *.min.js, src/**/*.test.js, **/docs/'
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

      {error && <p className="text-danger text-xs">{error}</p>}

      {/* Reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowResetDialog(true)}
      >
        <RotateCcw size={14} />
        Reset to Defaults
      </Button>

      {/* Dialogs */}
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
        message="This will restore the default exclusion patterns list and case-sensitivity setting. Any custom patterns you've added will be lost."
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
