import React from 'react';

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  min,
  max,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      className={`
        w-full px-3 py-2 rounded-lg text-sm
        bg-bg-surface2 border border-border
        text-text-primary placeholder-text-muted
        focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
}
