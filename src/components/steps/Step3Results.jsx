import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import useSelectionStore from '../../store/useSelectionStore';
import useFileStore from '../../store/useFileStore';
import Button from '../ui/Button';
import MessageCard from '../messages/MessageCard';
import MessageToolbar from '../messages/MessageToolbar';

export default function Step3Results({ onBack }) {
  const { generatedMessages, selectedFiles } = useSelectionStore();
  const { files } = useFileStore();
  const [selectedIndices, setSelectedIndices] = useState(
    generatedMessages.map((_, i) => i)
  );

  const handleToggleSelect = useCallback((index) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIndices(generatedMessages.map((_, i) => i));
  }, [generatedMessages]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIndices([]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Generated Messages</h2>
        <p className="text-sm text-text-secondary mt-1">
          {generatedMessages.length} message{generatedMessages.length !== 1 ? 's' : ''} generated from {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <MessageToolbar
          messages={generatedMessages}
          selectedIndices={selectedIndices}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {generatedMessages.map((msg, idx) => (
          <MessageCard
            key={idx}
            message={msg}
            index={idx}
            total={generatedMessages.length}
            isSelected={selectedIndices.includes(idx)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>

      {generatedMessages.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-sm">No messages were generated.</p>
          <p className="text-xs mt-1">Go back and select some files first.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-start pt-8">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to File Selection
        </Button>
      </div>
    </div>
  );
}
