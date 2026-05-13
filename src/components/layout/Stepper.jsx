import React from 'react';
import { Check } from 'lucide-react';
import { STEPS } from '../../utils/constants';

export default function Stepper({ currentStep }) {
  return (
    <div className="bg-bg-surface/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center justify-center">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isFuture = currentStep < step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-full
                      transition-all duration-300 border-2
                      ${isCompleted
                        ? 'bg-success border-success text-white'
                        : isCurrent
                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30'
                        : 'bg-transparent border-border text-text-muted'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`
                      text-sm font-medium transition-colors duration-300 hidden sm:inline
                      ${isCompleted
                        ? 'text-success'
                        : isCurrent
                        ? 'text-text-primary'
                        : 'text-text-muted'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-4 sm:mx-6 rounded-full transition-all duration-500
                      ${isCompleted ? 'bg-success' : 'bg-border'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
