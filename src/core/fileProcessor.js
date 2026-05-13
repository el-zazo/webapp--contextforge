import { isBinaryFile, getExtension, isExcluded } from '../utils/fileUtils';

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function buildFileObject(file, path) {
  const name = file.name;
  const extension = getExtension(name);
  const binary = isBinaryFile(name);

  return {
    id: generateId(),
    name,
    path,
    size: file.size,
    content: '',
    isBinary: binary,
    isExcluded: false,
    extension,
    depth: path.split('/').length - 1,
    type: 'file',
    parentPath: path.includes('/') ? path.split('/').slice(0, -1).join('/') : '',
    _fileRef: file,
    _needsRead: !binary,
  };
}

async function readFileContent(fileObj) {
  if (fileObj._needsRead && !fileObj.isBinary) {
    try {
      fileObj.content = await readFileAsText(fileObj._fileRef);
    } catch (e) {
      // Files that can't be read will have empty content
    }
  }
  // Remove internal references before returning to store
  delete fileObj._fileRef;
  delete fileObj._needsRead;
  return fileObj;
}

export async function processFiles(fileList) {
  const rootName = fileList[0]?.webkitRelativePath?.split('/')[0] || 'root';
  const files = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const relativePath = file.webkitRelativePath;
    // Remove the root folder from the path
    const pathWithoutRoot = relativePath.split('/').slice(1).join('/');

    if (!pathWithoutRoot) continue;

    const name = file.name;
    const extension = getExtension(name);
    const binary = isBinaryFile(name);
    let content = '';

    if (!binary) {
      try {
        content = await readFileAsText(file);
      } catch (e) {
        // Skip files that can't be read
        continue;
      }
    }

    files.push({
      id: generateId(),
      name,
      path: pathWithoutRoot,
      size: file.size,
      content,
      isBinary: binary,
      isExcluded: false,
      extension,
      depth: pathWithoutRoot.split('/').length - 1,
      type: 'file',
      parentPath: pathWithoutRoot.includes('/')
        ? pathWithoutRoot.split('/').slice(0, -1).join('/')
        : '',
    });
  }

  return { rootName, files };
}

// --- Drag & Drop support using webkitGetAsEntry ---

function getFileFromEntry(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function readAllDirectoryEntries(reader) {
  return new Promise((resolve, reject) => {
    const allEntries = [];
    function readBatch() {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(allEntries);
        } else {
          allEntries.push(...batch);
          readBatch();
        }
      }, reject);
    }
    readBatch();
  });
}

async function readEntryRecursive(entry, currentPath, results) {
  if (entry.isFile) {
    try {
      const file = await getFileFromEntry(entry);
      const path = currentPath ? `${currentPath}/${file.name}` : file.name;
      results.push(buildFileObject(file, path));
    } catch (e) {
      // Skip files that can't be accessed
    }
  } else if (entry.isDirectory) {
    try {
      const childPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      const reader = entry.createReader();
      const childEntries = await readAllDirectoryEntries(reader);
      for (const childEntry of childEntries) {
        await readEntryRecursive(childEntry, childPath, results);
      }
    } catch (e) {
      // Skip directories that can't be read
    }
  }
}

export async function processDroppedEntries(dataTransferItems) {
  const entries = [];
  for (const item of dataTransferItems) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      entries.push(entry);
    }
  }

  if (entries.length === 0) return { rootName: '', files: [] };

  let rootName;
  const allFileObjects = [];

  if (entries.length === 1 && entries[0].isDirectory) {
    // Single folder dropped — use its name as root, read contents inside it
    const dirEntry = entries[0];
    rootName = dirEntry.name;
    const reader = dirEntry.createReader();
    const childEntries = await readAllDirectoryEntries(reader);
    for (const child of childEntries) {
      await readEntryRecursive(child, '', allFileObjects);
    }
  } else {
    // Multiple items or single file dropped — use first entry name
    rootName = entries[0].name || 'dropped-files';
    for (const entry of entries) {
      await readEntryRecursive(entry, '', allFileObjects);
    }
  }

  // Read text content for all non-binary files in parallel
  await Promise.all(allFileObjects.map((f) => readFileContent(f)));

  return { rootName, files: allFileObjects };
}
