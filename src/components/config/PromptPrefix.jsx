import React from 'react';
import useConfigStore from '../../store/useConfigStore';

export default function PromptPrefix() {
  const { promptPrefix, setPromptPrefix } = useConfigStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Prompt Prefix <span className="text-text-muted font-normal">(Optional)</span>
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          This text will be placed BEFORE all file contents in the first message.
        </p>
      </div>

      <div className="space-y-1">
        <textarea
          value={promptPrefix}
          onChange={(e) => setPromptPrefix(e.target.value)}
          placeholder="e.g. Here are the relevant project files. Please review them:"
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm bg-bg-surface2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-150 font-sans"
        />
        <div className="text-right text-xs text-text-muted">
          {promptPrefix.length.toLocaleString()} characters
        </div>
      </div>
    </div>
  );
}
