import React from 'react';

const colorMap = {
  default: 'bg-bg-surface2 text-text-secondary border-border',
  accent: 'bg-accent-muted text-accent border-accent/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  muted: 'bg-bg-surface text-text-muted border-border-subtle',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border
        ${colorMap[color] || colorMap.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
