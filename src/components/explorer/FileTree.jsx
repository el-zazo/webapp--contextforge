import React, { useMemo, useCallback } from 'react';
import useFileStore from '../../store/useFileStore';
import useConfigStore from '../../store/useConfigStore';
import useSelectionStore from '../../store/useSelectionStore';
import FileTreeNode from './FileTreeNode';
import { isExcluded } from '../../utils/fileUtils';

export default function FileTree() {
  const { files, rootName, searchQuery, activeExtensions, sortBy } = useFileStore();
  const { excludedPatterns } = useConfigStore();
  const { selectedFiles, addFile, removeFile } = useSelectionStore();

  const processedFiles = useMemo(() => {
    return files.map((f) => ({
      ...f,
      isExcluded: isExcluded(f.name, false, excludedPatterns) ||
        f.path.split('/').some((part, idx) => {
          const subPath = f.path.split('/').slice(0, idx + 1).join('/');
          const folderName = part;
          return isExcluded(folderName, true, excludedPatterns);
        }),
    }));
  }, [files, excludedPatterns]);

  const filteredFiles = useMemo(() => {
    let result = processedFiles.filter((f) => f.type === 'file');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
    }

    if (activeExtensions.length > 0) {
      // Keep all files but mark non-matching
      // We don't filter out entirely, we just mark them
    }

    return result;
  }, [processedFiles, searchQuery, activeExtensions]);

  const searchMatchPaths = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    const matches = new Set();
    processedFiles.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)) {
        matches.add(f.path);
        // Add all parent paths
        const parts = f.path.split('/');
        for (let i = 1; i <= parts.length; i++) {
          matches.add(parts.slice(0, i).join('/'));
        }
      }
    });
    return matches;
  }, [processedFiles, searchQuery]);

  const extMatchPaths = useMemo(() => {
    if (activeExtensions.length === 0) return null;
    const matches = new Set();
    processedFiles.forEach((f) => {
      if (activeExtensions.includes(f.extension)) {
        matches.add(f.path);
        const parts = f.path.split('/');
        for (let i = 1; i <= parts.length; i++) {
          matches.add(parts.slice(0, i).join('/'));
        }
      }
    });
    return matches;
  }, [processedFiles, activeExtensions]);

  const tree = useMemo(() => {
    return buildTree(processedFiles, sortBy);
  }, [processedFiles, sortBy]);

  const matchCache = useMemo(() => {
    const cache = {};
    processedFiles.forEach((f) => {
      const matchesSearch = !searchMatchPaths || searchMatchPaths.has(f.path);
      const matchesExt = !extMatchPaths || extMatchPaths.has(f.path);
      cache[f.path] = matchesSearch && matchesExt;
    });
    return cache;
  }, [processedFiles, searchMatchPaths, extMatchPaths]);

  const folderChildMatchCache = useMemo(() => {
    const cache = {};
    function check(folder) {
      let hasMatch = false;
      if (folder.files) {
        for (const f of folder.files) {
          if (matchCache[f.path]) hasMatch = true;
        }
      }
      if (folder.subfolders) {
        for (const [, sub] of Object.entries(folder.subfolders)) {
          if (check(sub)) hasMatch = true;
        }
      }
      cache[folder.path] = hasMatch;
      return hasMatch;
    }
    check(tree);
    return cache;
  }, [tree, matchCache]);

  const handleAddFile = useCallback(
    (fileId) => addFile(fileId),
    [addFile]
  );

  const handleRemoveFile = useCallback(
    (fileId) => removeFile(fileId),
    [removeFile]
  );

  if (processedFiles.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        No files found in the imported folder.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[calc(100vh-320px)]">
      {renderFolder(tree, '', 0, selectedFiles, handleAddFile, handleRemoveFile, matchCache, folderChildMatchCache, searchMatchPaths, extMatchPaths, excludedPatterns)}
    </div>
  );
}

function buildTree(files, sortBy) {
  const root = { path: '', subfolders: {}, files: [] };

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.files.push({ ...file, name: part });
      } else {
        const folderPath = parts.slice(0, i + 1).join('/');
        if (!current.subfolders[part]) {
          current.subfolders[part] = {
            name: part,
            path: folderPath,
            subfolders: {},
            files: [],
          };
        }
        current = current.subfolders[part];
      }
    }
  });

  // Sort
  sortTree(root, sortBy);

  return root;
}

function sortTree(node, sortBy) {
  node.files.sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'size-asc': return a.size - b.size;
      case 'size-desc': return b.size - a.size;
      case 'ext-asc': return a.extension.localeCompare(b.extension);
      default: return a.name.localeCompare(b.name);
    }
  });

  Object.values(node.subfolders).forEach((sub) => sortTree(sub, sortBy));
}

function renderFolder(folder, folderName, depth, selectedFiles, onAdd, onRemove, matchCache, folderChildMatchCache, searchMatchPaths, extMatchPaths, excludedPatterns) {
  const children = [];

  // Render subfolders
  Object.entries(folder.subfolders).forEach(([name, sub]) => {
    const hasMatchingChild = folderChildMatchCache[sub.path] || false;
    const matchesSearch = searchMatchPaths ? searchMatchPaths.has(sub.path) : true;
    const folderIsExcluded = isExcluded(name, true, excludedPatterns);
    const folderNode = {
      id: `folder-${sub.path}`,
      name,
      path: sub.path,
      type: 'folder',
      childCount: countFilesRecursive(sub),
      isExcluded: folderIsExcluded,
    };

    const subChildren = renderFolder(sub, name, depth + 1, selectedFiles, onAdd, onRemove, matchCache, folderChildMatchCache, searchMatchPaths, extMatchPaths, excludedPatterns);

    children.push(
      <FileTreeNode
        key={`folder-${sub.path}`}
        node={folderNode}
        selectedFileIds={selectedFiles}
        onAddFile={onAdd}
        onRemoveFile={onRemove}
        matchesSearch={matchesSearch}
        hasMatchingChild={hasMatchingChild}
        defaultExpanded={!!searchMatchPaths || !!extMatchPaths}
      >
        {subChildren}
      </FileTreeNode>
    );
  });

  // Render files
  folder.files.forEach((file) => {
    const matchesSearch = matchCache[file.path] !== false;
    const fileNode = {
      id: file.id,
      name: file.name,
      path: file.path,
      type: 'file',
      size: file.size,
      content: file.content,
      isBinary: file.isBinary,
      isExcluded: file.isExcluded,
      extension: file.extension,
    };

    children.push(
      <FileTreeNode
        key={file.id}
        node={fileNode}
        selectedFileIds={selectedFiles}
        onAddFile={onAdd}
        onRemoveFile={onRemove}
        matchesSearch={matchCache[file.path] !== false}
        hasMatchingChild={false}
      />
    );
  });

  return <>{children}</>;
}

function countFilesRecursive(folder) {
  let count = folder.files.filter((f) => !f.isExcluded).length;
  Object.values(folder.subfolders).forEach((sub) => {
    count += countFilesRecursive(sub);
  });
  return count;
}
