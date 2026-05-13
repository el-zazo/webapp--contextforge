import React from 'react';
import { Download, CheckSquare, Square } from 'lucide-react';
import Button from '../ui/Button';
import { downloadMessagesAsZip } from '../../core/zipExporter';

export default function MessageToolbar({
  messages,
  selectedIndices,
  onSelectAll,
  onDeselectAll,
}) {
  const allSelected = selectedIndices.length === messages.length;
  const noneSelected = selectedIndices.length === 0;

  async function handleDownloadSelected() {
    if (selectedIndices.length === 0) return;
    await downloadMessagesAsZip(messages, selectedIndices, 'contextforge-selected.zip');
  }

  async function handleDownloadAll() {
    await downloadMessagesAsZip(messages, null, 'contextforge-all.zip');
  }

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSelectAll} disabled={allSelected}>
          <CheckSquare size={14} />
          Select All
        </Button>
        <Button variant="ghost" size="sm" onClick={onDeselectAll} disabled={noneSelected}>
          <Square size={14} />
          Deselect All
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadSelected}
          disabled={noneSelected}
          title={noneSelected ? 'Select at least one message' : ''}
        >
          <Download size={14} />
          Download Selected (.zip)
        </Button>
        <Button variant="primary" size="sm" onClick={handleDownloadAll}>
          <Download size={14} />
          Download All (.zip)
        </Button>
      </div>
    </div>
  );
}
