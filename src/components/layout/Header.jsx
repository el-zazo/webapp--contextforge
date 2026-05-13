import React from 'react';
import { Hammer } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10">
          <Hammer size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            ContextForge
          </h1>
          <p className="text-xs text-text-muted">
            Prepare file contents for AI chat tools
          </p>
        </div>
      </div>
    </header>
  );
}
