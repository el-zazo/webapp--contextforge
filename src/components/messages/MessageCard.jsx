import React, { useState, useCallback } from 'react';
import { Copy, Download, FileText, FileCode } from 'lucide-react';
import Badge from '../ui/Badge';
import { downloadAsFile } from '../../core/zipExporter';

export default function MessageCard({ message, index, total, isSelected, onToggleSelect }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message]);

  const handleDownloadTxt = useCallback(() => {
    downloadAsFile(message, `message-${index + 1}.txt`);
  }, [message, index]);

  const handleDownloadMd = useCallback(() => {
    downloadAsFile(message, `message-${index + 1}.md`);
  }, [message, index]);

  return (
    <div className={`bg-bg-surface border rounded-xl overflow-hidden transition-all duration-200 ${isSelected ? 'border-accent' : 'border-border'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface2/50 border-b border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(index)}
            className="w-4 h-4 rounded border-border bg-bg-surface2 text-accent focus:ring-accent/50 focus:ring-offset-0 cursor-pointer accent-accent"
          />
          <span className="text-sm font-medium text-text-primary">
            Message {index + 1} / {total}
          </span>
        </label>
        <Badge color="accent">
          {message.length.toLocaleString()} chars
        </Badge>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-auto p-4">
        <pre className="text-xs font-mono text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
          {message}
        </pre>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface2/30 border-t border-border">
        <button
          onClick={handleCopy}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-150 cursor-pointer border
            ${copied
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-bg-surface2 text-text-secondary border-border hover:text-text-primary hover:bg-border'
            }
          `}
        >
          <Copy size={12} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownloadTxt}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-surface2 text-text-secondary border border-border hover:text-text-primary hover:bg-border transition-all duration-150 cursor-pointer"
        >
          <FileText size={12} />
          .txt
        </button>
        <button
          onClick={handleDownloadMd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-surface2 text-text-secondary border border-border hover:text-text-primary hover:bg-border transition-all duration-150 cursor-pointer"
        >
          <FileCode size={12} />
          .md
        </button>
      </div>
    </div>
  );
}
