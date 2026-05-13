import React from 'react';
import useConfigStore from '../../store/useConfigStore';

export default function PromptSuffix() {
  const { promptSuffix, setPromptSuffix } = useConfigStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Prompt Suffix / AI Question <span className="text-text-muted font-normal">(Optional)</span>
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Write your question or instruction for the AI here. It will be placed AFTER all file contents in the last message.
        </p>
      </div>

      <div className="space-y-1">
        <textarea
          value={promptSuffix}
          onChange={(e) => setPromptSuffix(e.target.value)}
          placeholder="e.g. Please fix the bug in the useEffect hook and explain your changes."
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm bg-bg-surface2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-150 font-sans"
        />
        <div className="text-right text-xs text-text-muted">
          {promptSuffix.length.toLocaleString()} characters
        </div>
      </div>
    </div>
  );
}
