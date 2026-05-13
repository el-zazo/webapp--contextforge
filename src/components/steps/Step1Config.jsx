import React from 'react';
import { ArrowRight } from 'lucide-react';
import MaxLengthSetting from '../config/MaxLengthSetting';
import ExclusionManager from '../config/ExclusionManager';
import PromptPrefix from '../config/PromptPrefix';
import PromptSuffix from '../config/PromptSuffix';
import Button from '../ui/Button';

export default function Step1Config({ onNext }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Configuration</h2>
        <p className="text-sm text-text-secondary mt-1">
          Configure how your files will be formatted and split into messages.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <MaxLengthSetting />
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <ExclusionManager />
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <PromptPrefix />
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <PromptSuffix />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg">
          Import & Select Files
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
