import React, { useState, useRef, useCallback } from 'react';
import { FolderOpen, ArrowLeft, Zap, X, Trash2, Folder } from 'lucide-react';
import useFileStore from '../../store/useFileStore';
import useConfigStore from '../../store/useConfigStore';
import useSelectionStore from '../../store/useSelectionStore';
import { processFiles } from '../../core/fileProcessor';
import { isExcluded, formatFileSize, formatCharCount, getUniqueExtensions } from '../../utils/fileUtils';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import SearchBar from '../explorer/SearchBar';
import FilterSort from '../explorer/FilterSort';
import FileTree from '../explorer/FileTree';
import { generateMessages } from '../../core/messageSplitter';

export default function Step2Import({ onBack, onNext }) {
  const { rootName, files, setRootName, setFiles, clearFiles } = useFileStore();
  const { excludedPatterns } = useConfigStore();
  const { selectedFiles, addFile, removeFile, clearSelection, setGeneratedMessages } = useSelectionStore();
  const fileInputRef = useRef(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showRemoveFileDialog, setShowRemoveFileDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasImported = files.length > 0;

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(async (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsLoading(true);
    try {
      const { rootName: name, files: processedFiles } = await processFiles(fileList);
      const withExclusion = processedFiles.map((f) => ({
        ...f,
        isExcluded:
          isExcluded(f.name, false, excludedPatterns) ||
          f.path.split('/').some((part, idx) => {
            const folderName = part;
            return isExcluded(folderName, true, excludedPatterns);
          }),
      }));
      setRootName(name);
      setFiles(withExclusion);
    } catch (err) {
      console.error('Error processing files:', err);
    }
    setIsLoading(false);
    // Reset input so same folder can be re-imported
    e.target.value = '';
  }, [excludedPatterns, setRootName, setFiles]);

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

  // Selected files data
  const selectedFileData = selectedFiles
    .map((id) => files.find((f) => f.id === id))
    .filter(Boolean);

  const totalChars = selectedFileData.reduce((sum, f) => sum + (f.content?.length || 0), 0);

  // Import zone
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

        <div
          onClick={handleImportClick}
          className="flex flex-col items-center justify-center py-20 px-8 bg-bg-surface border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-bg-surface2/50 transition-all duration-200 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
            <Folder size={32} className="text-accent" />
          </div>
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
        </div>

        {isLoading && (
          <div className="text-center mt-4 text-sm text-text-secondary">
            Processing files...
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

  // Two-panel layout
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
        {/* Left panel - File Explorer */}
        <div className="bg-bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
          {/* Explorer header */}
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

          {/* Search */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <SearchBar />
          </div>

          {/* Filter & Sort */}
          <div className="px-4 py-2 border-b border-border-subtle">
            <FilterSort />
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-auto p-2">
            <FileTree />
          </div>
        </div>

        {/* Right panel - Selected Files */}
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

          {/* File list */}
          <div className="flex-1 overflow-auto p-4 space-y-2 min-h-[200px]">
            {selectedFileData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <FolderOpen size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No files selected yet.</p>
                <p className="text-xs mt-1">Use the [+] buttons in the explorer.</p>
              </div>
            ) : (
              selectedFileData.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 py-2 bg-bg-surface2 rounded-lg border border-border-subtle group"
                >
                  <span className="text-xs font-mono text-text-secondary truncate flex-1 min-w-0">
                    {file.path}
                  </span>
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
              ))
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

      {/* Dialogs */}
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
    </div>
  );
}
