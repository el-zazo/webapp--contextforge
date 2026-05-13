export function formatFileEntry(rootName, filePath, content, partNumber, totalParts) {
  const header = totalParts > 1
    ? `/${rootName}/${filePath} - PART ${partNumber}`
    : `/${rootName}/${filePath}`;

  return `${header}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}
