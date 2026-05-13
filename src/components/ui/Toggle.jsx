import React from 'react';

export default function Toggle({ enabled, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${enabled ? 'bg-accent' : 'bg-bg-surface2 border border-border'}
        `}
        onClick={() => onChange(!enabled)}
      >
        <div
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
            transition-transform duration-200 shadow-sm
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </label>
  );
}
