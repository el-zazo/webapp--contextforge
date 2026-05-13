import JSZip from 'jszip';

export async function downloadMessagesAsZip(messages, selectedIndices, filename = 'contextforge-messages.zip') {
  const zip = new JSZip();
  const indices = selectedIndices || messages.map((_, i) => i);

  indices.forEach((idx) => {
    const msg = messages[idx];
    if (msg !== undefined) {
      zip.file(`message-${idx + 1}.txt`, msg);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, filename);
}

export function downloadAsFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
