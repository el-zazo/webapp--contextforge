import { BINARY_EXTENSIONS } from './constants';

export function isBinaryFile(fileName) {
  const ext = getExtension(fileName);
  return BINARY_EXTENSIONS.has(ext);
}

export function getExtension(fileName) {
  const idx = fileName.lastIndexOf('.');
  if (idx === -1) return '';
  return fileName.slice(idx).toLowerCase();
}

export function matchesExclusionPattern(fileName, isFolder, pattern) {
  const trimmed = pattern.trim();
  if (!trimmed) return false;

  // Pattern ending with / matches folder names
  if (trimmed.endsWith('/')) {
    if (!isFolder) return false;
    const folderPattern = trimmed.slice(0, -1);
    // wildcard support
    if (folderPattern.includes('*')) {
      const regex = new RegExp('^' + folderPattern.replace(/\*/g, '.*') + '$');
      return regex.test(fileName);
    }
    return fileName === folderPattern;
  }

  // Pattern starting with * matches file extensions
  if (trimmed.startsWith('*.')) {
    if (isFolder) return false;
    const ext = trimmed.slice(1); // e.g. ".lock"
    return fileName.endsWith(ext);
  }

  // Exact filename match
  if (isFolder) return false;
  return fileName === trimmed;
}

export function isExcluded(name, isFolder, patterns) {
  return patterns.some((p) => matchesExclusionPattern(name, isFolder, p));
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatCharCount(count) {
  return count.toLocaleString() + ' chars';
}

export function buildFileTree(files, rootName) {
  const tree = {};
  const allNodes = [];

  // Create folder nodes from paths
  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!tree[currentPath]) {
        const node = {
          id: isLast ? file.id : `folder-${currentPath}`,
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'folder',
          parentPath: i === 0 ? '' : parts.slice(0, i).join('/'),
          depth: i,
          isBinary: isLast ? file.isBinary : false,
          isExcluded: false,
          extension: isLast ? file.extension : '',
          size: isLast ? file.size : 0,
          content: isLast ? file.content : '',
          childCount: 0,
        };
        tree[currentPath] = node;
        allNodes.push(node);
      }
    }
  });

  // Calculate child counts for folders
  const folderMap = {};
  allNodes.forEach((node) => {
    if (node.type === 'folder') {
      folderMap[node.path] = node;
    }
  });

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      if (folderMap[currentPath] && !file.isExcluded) {
        folderMap[currentPath].childCount++;
      }
    }
  });

  return { tree, allNodes, folderMap };
}

export function getUniqueExtensions(files) {
  const exts = new Set();
  files.forEach((f) => {
    if (f.extension && !f.isBinary) {
      exts.add(f.extension);
    }
  });
  return Array.from(exts).sort();
}
