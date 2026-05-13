import React, { useState, useRef, useCallback } from 'react';
import {
  FolderOpen,
  ArrowLeft,
  Zap,
  X,
  Trash2,
  Folder,
  AlertTriangle,
} from 'lucide-react';
import useFileStore from '../../store/useFileStore';
import useConfigStore from '../../store/useConfigStore';
import useSelectionStore from '../../store/useSelectionStore';
import { processFiles, processDroppedEntries } from '../../core/fileProcessor';
import { isFileExcluded, formatFileSize, formatCharCount } from '../../utils/fileUtils';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import SearchBar from '../explorer/SearchBar';
import FilterSort from '../explorer/FilterSort';
import FileTree from '../explorer/FileTree';
import { generateMessages } from '../../core/messageSplitter';

export default function Step2Import({ onBack, onNext }) {
  const { rootName, files, setRootName, setFiles, clearFiles } = useFileStore();
  const { excludedPatterns, caseSensitivePatterns } = useConfigStore();
  const { selectedFiles, addFile, removeFile, clearSelection, setGeneratedMessages } = useSelectionStore();

  const fileInputRef = useRef(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showRemoveFileDialog, setShowRemoveFileDialog] = useState(null);
  const [showRemoveExcludedDialog, setShowRemoveExcludedDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Drag & Drop state — use a counter so child enter/leave events don't flicker
  const [dragCounter, setDragCounter] = useState(0);
  const isDragOver = dragCounter > 0;

  const hasImported = files.length > 0;

  // ── helpers: apply exclusion flags to processed files ──────────────────────
  const applyExclusionFlags = useCallback(
    (fileList) =>
      fileList.map((f) => ({
        ...f,
        isExcluded: isFileExcluded(f, excludedPatterns, caseSensitivePatterns),
      })),
    [excludedPatterns, caseSensitivePatterns]
  );

  // ── handlers: button import ───────────────────────────────────────────────
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    async (e) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      setIsLoading(true);
      try {
        const { rootName: name, files: processed } = await processFiles(fileList);
        setRootName(name);
        setFiles(applyExclusionFlags(processed));
      } catch (err) {
        console.error('Error processing files:', err);
      }
      setIsLoading(false);
      e.target.value = '';
    },
    [applyExclusionFlags, setRootName, setFiles]
  );

  // ── handlers: drag & drop ─────────────────────────────────────────────────
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => c + 1);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => c - 1);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(0);

      const items = e.dataTransfer?.items;
      if (!items || items.length === 0) return;

      setIsLoading(true);
      try {
        const { rootName: name, files: processed } =
          await processDroppedEntries(items);
        if (processed.length > 0) {
          setRootName(name);
          setFiles(applyExclusionFlags(processed));
        }
      } catch (err) {
        console.error('Error processing dropped files:', err);
      }
      setIsLoading(false);
    },
    [applyExclusionFlags, setRootName, setFiles]
  );

  // ── handlers: navigation / misc ───────────────────────────────────────────
  const handleChangeFolder = useCallback(() => {
    if (selectedFiles.length > 0 || files.length > 0) {
      setShowChangeDialog(true);
    } else {
      clearFiles();
      clearSelection();
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }, [selectedFiles, files, clearFiles, clearSelection]);

  const confirmChangeFolder = useCallback(() => {
    clearFiles();
    clearSelection();
    setShowChangeDialog(false);
    setTimeout(() => fileInputRef.current?.click(), 100);
  }, [clearFiles, clearSelection]);

  const handleGenerate = useCallback(() => {
    const selectedFileObjects = selectedFiles
      .map((id) => files.find((f) => f.id === id))
      .filter(Boolean);

    const config = useConfigStore.getState();
    const root = useFileStore.getState().rootName;
    const messages = generateMessages(selectedFileObjects, config, root);
    setGeneratedMessages(messages);
    onNext();
  }, [selectedFiles, files, setGeneratedMessages, onNext]);

  // ── derived data ──────────────────────────────────────────────────────────
  const selectedFileData = selectedFiles
    .map((id) => files.find((f) => f.id === id))
    .filter(Boolean);

  const totalChars = selectedFileData.reduce(
    (sum, f) => sum + (f.content?.length || 0),
    0
  );

  // Determine which selected files are now excluded by the current patterns
  const excludedSelectedFiles = selectedFileData.filter(
    (f) => isFileExcluded(f, excludedPatterns, caseSensitivePatterns)
  );

  const excludedSelectedCount = excludedSelectedFiles.length;

  const confirmRemoveExcluded = useCallback(() => {
    const excludedIds = new Set(excludedSelectedFiles.map((f) => f.id));
    const remaining = selectedFiles.filter((id) => !excludedIds.has(id));
    clearSelection();
    remaining.forEach((id) => addFile(id));
    setShowRemoveExcludedDialog(false);
  }, [excludedSelectedFiles, selectedFiles, clearSelection, addFile]);

  // ── render: import zone (before folder is imported) ───────────────────────
  if (!hasImported) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <input
          ref={fileInputRef}
          type="file"
          webkitdirectory=""
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Browser Permission Notice */}
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-warning/5 border border-warning/20 rounded-lg">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">Browser Permission Notice</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              When importing folders with many files, your browser may show a native
              confirmation dialog. This is a browser security feature and is completely
              normal. Click&nbsp;
              <span className="font-semibold text-text-primary">"Import"</span> or{' '}
              <span className="font-semibold text-text-primary">"Allow"</span> to proceed.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={handleImportClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center py-20 px-8
            bg-bg-surface border-2 border-dashed rounded-2xl cursor-pointer
            transition-all duration-200 group
            ${isDragOver
              ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
              : 'border-border hover:border-accent/50 hover:bg-bg-surface2/50'
            }
          `}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
              isDragOver ? 'bg-accent/20' : 'bg-accent/10 group-hover:bg-accent/20'
            }`}
          >
            <Folder size={32} className="text-accent" />
          </div>

          {isDragOver ? (
            <>
              <h3 className="text-lg font-semibold text-accent mb-2">
                Drop your folder here
              </h3>
              <p className="text-sm text-text-secondary text-center">
                Release to import the folder
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Import your project folder
              </h3>
              <p className="text-sm text-text-secondary mb-6 text-center">
                Select a folder to explore its structure
              </p>
              <Button onClick={(e) => { e.stopPropagation(); handleImportClick(); }}>
                <FolderOpen size={16} />
                Import Folder
              </Button>
              <p className="text-xs text-text-muted mt-4 text-center">
                You can also drag &amp; drop a folder directly onto this area
              </p>
            </>
          )}
        </div>

        {isLoading && (
          <div className="text-center mt-4 text-sm text-text-secondary">
            Processing files…
          </div>
        )}

        <div className="flex justify-start pt-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Configuration
          </Button>
        </div>

        <ConfirmDialog
          isOpen={showChangeDialog}
          title="Change Folder"
          message="Changing the folder will reset all file selections and the current file tree. Continue?"
          confirmLabel="Change Folder"
          cancelLabel="Cancel"
          isDangerous
          onConfirm={confirmChangeFolder}
          onCancel={() => setShowChangeDialog(false)}
        />
      </div>
    );
  }

  // ── render: two-panel layout (after import) ──────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left panel — File Explorer ── */}
        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-surface2/30">
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen size={16} className="text-warning flex-shrink-0" />
              <span className="text-sm font-semibold text-text-primary truncate">
                {rootName}
              </span>
              <Badge color="muted">{files.length} files</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleChangeFolder}>
              Change Folder
            </Button>
          </div>

          <div className="px-4 py-3 border-b border-border-subtle">
            <SearchBar />
          </div>
          <div className="px-4 py-2 border-b border-border-subtle">
            <FilterSort />
          </div>
          <div className="flex-1 overflow-auto p-2">
            <FileTree />
          </div>
        </div>

        {/* ── Right panel — Selected Files ── */}
        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-surface2/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Selected Files</span>
              <Badge color="accent">
                {selectedFileData.length} files | ~{totalChars.toLocaleString()} chars total
              </Badge>
            </div>
          </div>

          {/* Excluded-files banner */}
          {excludedSelectedCount > 0 && (
            <div className="mx-4 mt-3 flex items-start gap-3 px-3 py-2.5 bg-warning/5 border border-warning/20 rounded-lg">
              <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-semibold text-warning">{excludedSelectedCount}</span>{' '}
                  selected file{excludedSelectedCount !== 1 ? 's' : ''} {' '}
                  {excludedSelectedCount !== 1 ? 'are' : 'is'} now excluded by your configuration.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveExcludedDialog(true)}
                className="flex-shrink-0 text-warning hover:text-warning text-xs"
              >
                Remove All Excluded
              </Button>
            </div>
          )}

          {/* File list */}
          <div className="flex-1 overflow-auto p-4 space-y-2 min-h-[200px]">
            {selectedFileData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <FolderOpen size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No files selected yet.</p>
                <p className="text-xs mt-1">Use the [+] buttons in the explorer.</p>
              </div>
            ) : (
              selectedFileData.map((file) => {
                const fileNowExcluded = isFileExcluded(
                  file,
                  excludedPatterns,
                  caseSensitivePatterns
                );

                return (
                  <div
                    key={file.id}
                    className={`
                      flex items-center gap-3 px-3 py-2 bg-bg-surface2 rounded-lg border group
                      transition-colors duration-150
                      ${fileNowExcluded
                        ? 'opacity-60 border-warning/20'
                        : 'border-border-subtle'
                      }
                    `}
                  >
                    <span
                      className={`text-xs font-mono truncate flex-1 min-w-0 ${
                        fileNowExcluded ? 'text-text-muted' : 'text-text-secondary'
                      }`}
                    >
                      {file.path}
                    </span>

                    {fileNowExcluded && (
                      <Badge color="warning">Excluded</Badge>
                    )}

                    <Badge color="muted">{formatFileSize(file.size)}</Badge>
                    <Badge color="info">{formatCharCount(file.content?.length || 0)}</Badge>

                    <button
                      onClick={() => setShowRemoveFileDialog(file)}
                      className="flex-shrink-0 text-text-muted hover:text-danger transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Remove from selection"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selectedFileData.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearAllDialog(true)}
                className="text-danger hover:text-danger"
              >
                <Trash2 size={14} />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Configuration
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={selectedFiles.length === 0}
          title={selectedFiles.length === 0 ? 'Select at least one file' : ''}
        >
          <Zap size={16} />
          Generate Messages
        </Button>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}

      <ConfirmDialog
        isOpen={showChangeDialog}
        title="Change Folder"
        message="Changing the folder will reset all file selections and the current file tree. Continue?"
        confirmLabel="Change Folder"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={confirmChangeFolder}
        onCancel={() => setShowChangeDialog(false)}
      />

      <ConfirmDialog
        isOpen={showClearAllDialog}
        title="Clear All Selections"
        message="Remove all files from your selection?"
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={() => {
          clearSelection();
          setShowClearAllDialog(false);
        }}
        onCancel={() => setShowClearAllDialog(false)}
      />

      <ConfirmDialog
        isOpen={!!showRemoveFileDialog}
        title="Remove File"
        message={`Remove "${showRemoveFileDialog?.path}" from selection?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={() => {
          if (showRemoveFileDialog) {
            removeFile(showRemoveFileDialog.id);
          }
          setShowRemoveFileDialog(null);
        }}
        onCancel={() => setShowRemoveFileDialog(null)}
      />

      <ConfirmDialog
        isOpen={showRemoveExcludedDialog}
        title="Remove Excluded Files"
        message={`This will remove ${excludedSelectedCount} excluded file${excludedSelectedCount !== 1 ? 's' : ''} from your selection. Do you want to continue?`}
        confirmLabel="Remove Excluded"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={confirmRemoveExcluded}
        onCancel={() => setShowRemoveExcludedDialog(false)}
      />
    </div>
  );
}
