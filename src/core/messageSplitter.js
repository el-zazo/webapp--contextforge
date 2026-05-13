import { formatFileEntry } from './formatter';

export function generateMessages(selectedFiles, config, rootName) {
  const { maxLengthEnabled, maxLength, promptPrefix, promptSuffix } = config;

  if (!maxLengthEnabled) {
    return [buildSingleMessage(selectedFiles, rootName, promptPrefix, promptSuffix)];
  }

  return buildSplitMessages(selectedFiles, rootName, maxLength, promptPrefix, promptSuffix);
}

function buildSingleMessage(files, rootName, prefix, suffix) {
  let message = '';
  if (prefix) message += prefix + '\n\n';
  files.forEach((file) => {
    message += formatFileEntry(rootName, file.path, file.content);
  });
  if (suffix) message += '\n' + suffix;
  return message.trim();
}

function buildSplitMessages(files, rootName, maxLen, prefix, suffix) {
  const messages = [];
  let currentMessage = '';

  // Add prefix to first message
  if (prefix) {
    currentMessage = prefix + '\n\n';
  }

  files.forEach((file) => {
    const formatted = formatFileEntry(rootName, file.path, file.content);

    if (formatted.length <= maxLen) {
      // File fits within maxLength
      if (currentMessage.length + formatted.length > maxLen) {
        // Doesn't fit in current message, finalize and start new
        if (currentMessage.trim()) {
          messages.push(currentMessage.trim());
        }
        currentMessage = formatted;
      } else {
        currentMessage += formatted;
      }
    } else {
      // File alone exceeds maxLength — need to split
      if (currentMessage.trim()) {
        messages.push(currentMessage.trim());
        currentMessage = '';
      }

      const chunks = splitContentIntoChunks(file.content, maxLen);
      const totalParts = chunks.length;

      chunks.forEach((chunk, idx) => {
        const partEntry = formatFileEntry(rootName, file.path, chunk, idx + 1, totalParts);

        if (currentMessage.length + partEntry.length > maxLen) {
          if (currentMessage.trim()) {
            messages.push(currentMessage.trim());
          }
          currentMessage = partEntry;
        } else {
          currentMessage += partEntry;
        }
      });
    }
  });

  // Add suffix to last message
  if (suffix) {
    if (currentMessage.length + suffix.length + 2 > maxLen && currentMessage.trim()) {
      messages.push(currentMessage.trim());
      currentMessage = suffix;
    } else {
      currentMessage += '\n' + suffix;
    }
  }

  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }

  return messages;
}

function splitContentIntoChunks(content, maxLen) {
  const headerOverhead = 200; // Estimated overhead for header + backticks
  const availableSpace = maxLen - headerOverhead;
  
  if (availableSpace <= 0) {
    // Fallback: just split by characters
    const chunks = [];
    for (let i = 0; i < content.length; i += Math.max(100, maxLen - 100)) {
      chunks.push(content.slice(i, i + Math.max(100, maxLen - 100)));
    }
    return chunks;
  }

  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.length > availableSpace) {
      // Single line exceeds available space — split the line
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      // Split long line into pieces
      let remaining = line;
      while (remaining.length > 0) {
        const piece = remaining.slice(0, availableSpace);
        chunks.push(piece);
        remaining = remaining.slice(availableSpace);
      }
    } else if (currentChunk.length + line.length + 1 > availableSpace) {
      // Adding this line would exceed — finalize current chunk
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + line : line;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [content];
}
