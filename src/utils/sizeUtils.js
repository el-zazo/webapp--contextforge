export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatNumber(num) {
  return num.toLocaleString();
}

export function estimateMessageCount(totalChars, maxLength) {
  if (!maxLength || maxLength <= 0) return 1;
  return Math.ceil(totalChars / maxLength);
}
