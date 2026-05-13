import { isBinaryFile, getExtension, isExcluded } from '../utils/fileUtils';

function generateId() {
  return Math.random().toString(36).substring(2, 11);
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
    const isBinary = isBinaryFile(name);
    let content = '';

    if (!isBinary) {
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
      isBinary,
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

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
