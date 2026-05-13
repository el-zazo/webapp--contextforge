import React, { useState, useCallback } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  FolderPlus,
  Plus,
  Minus,
  Lock,
  Image,
} from 'lucide-react';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatFileSize, formatCharCount } from '../../utils/fileUtils';

function getFileIcon(node) {
  if (node.type === 'folder') return null;
  if (node.isBinary) {
    const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    if (imgExts.some((ext) => node.name.toLowerCase().endsWith(ext))) {
      return <Image size={14} className="text-purple-400" />;
    }
    return <Lock size={14} className="text-text-muted" />;
  }
  return <FileText size={14} className="text-blue-400" />;
}

export default function FileTreeNode({
  node,
  children,
  selectedFileIds,
  onAddFile,
  onRemoveFile,
  onAddFolder,
  matchesSearch,
  hasMatchingChild,
  defaultExpanded,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const isFolder = node.type === 'folder';
  const isSelected = selectedFileIds.includes(node.id);
  const isExcluded = node.isExcluded;
  const isDimmed = !matchesSearch && !hasMatchingChild;

  const handleToggle = useCallback(() => {
    if (isFolder && !isExcluded) {
      setExpanded((prev) => !prev);
    }
  }, [isFolder, isExcluded]);

  const handleAdd = useCallback(
    (e) => {
      e.stopPropagation();
      onAddFile(node.id);
    },
    [node.id, onAddFile]
  );

  const handleAddFolderClick = useCallback(
    (e) => {
      e.stopPropagation();
      onAddFolder(node.path);
    },
    [node.path, onAddFolder]
  );

  const handleRemoveClick = useCallback(
    (e) => {
      e.stopPropagation();
      setShowRemoveDialog(true);
    },
    []
  );

  const confirmRemove = useCallback(() => {
    onRemoveFile(node.id);
    setShowRemoveDialog(false);
  }, [node.id, onRemoveFile]);

  return (
    <div className={isDimmed ? 'opacity-40' : ''}>
      <div
        className={`
          flex items-center gap-1.5 py-1 px-2 rounded-md group
          hover:bg-bg-surface2 transition-colors duration-100
          ${isExcluded ? 'opacity-40' : ''}
        `}
      >
        {/* Expand/collapse */}
        {isFolder ? (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Icon */}
        {isFolder ? (
          expanded ? (
            <FolderOpen size={14} className="text-warning flex-shrink-0" />
          ) : (
            <Folder size={14} className="text-warning flex-shrink-0" />
          )
        ) : (
          <span className="flex-shrink-0">{getFileIcon(node)}</span>
        )}

        {/* Name */}
        <span className="text-sm text-text-primary truncate flex-1 min-w-0">
          {node.name}
        </span>

        {/* Badges */}
        {isFolder && (
          <Badge color="muted">{node.childCount} files</Badge>
        )}
        {isExcluded && (
          <Badge color="danger">Excluded</Badge>
        )}
        {!isFolder && node.isBinary && !isExcluded && (
          <Badge color="warning">Binary</Badge>
        )}
        {!isFolder && !isExcluded && !node.isBinary && (
          <>
            <Badge color="muted">{formatFileSize(node.size)}</Badge>
            <Badge color="info">{formatCharCount(node.content?.length || 0)}</Badge>
          </>
        )}

        {/* Action buttons */}
        {isFolder && !isExcluded && !isDimmed && (
          <button
            onClick={handleAddFolderClick}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-accent-muted text-accent hover:bg-accent/20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="Add all files in this folder"
          >
            <FolderPlus size={12} />
          </button>
        )}
        {!isFolder && !isExcluded && !node.isBinary && matchesSearch && !isDimmed && (
          <>
            {isSelected ? (
              <button
                onClick={handleRemoveClick}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                title="Remove from selection"
              >
                <Minus size={12} />
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-accent-muted text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                title="Add to selection"
              >
                <Plus size={12} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Children */}
      {isFolder && expanded && children && (
        <div className="ml-5 border-l border-border-subtle pl-1">
          {children}
        </div>
      )}

      <ConfirmDialog
        isOpen={showRemoveDialog}
        title="Remove File"
        message={`Remove "${node.path}" from selection?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isDangerous
        onConfirm={confirmRemove}
        onCancel={() => setShowRemoveDialog(false)}
      />
    </div>
  );
}
