import React, { useState } from 'react';
import Header from './components/layout/Header';
import Stepper from './components/layout/Stepper';
import Step1Config from './components/steps/Step1Config';
import Step2Import from './components/steps/Step2Import';
import Step3Results from './components/steps/Step3Results';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <Stepper currentStep={currentStep} />

      <main className="flex-1 overflow-auto">
        {currentStep === 1 && (
          <Step1Config onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <Step2Import
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}
        {currentStep === 3 && (
          <Step3Results onBack={() => setCurrentStep(2)} />
        )}
      </main>
    </div>
  );
}
