import React, { useState } from 'react';
import useConfigStore from '../../store/useConfigStore';
import Toggle from '../ui/Toggle';
import Input from '../ui/Input';
import { Info, AlertCircle } from 'lucide-react';

export default function MaxLengthSetting() {
  const { maxLengthEnabled, maxLength, setMaxLengthEnabled, setMaxLength } = useConfigStore();
  const [inputValue, setInputValue] = useState(String(maxLength));

  const parsedValue = parseInt(inputValue, 10);
  const isValid = !isNaN(parsedValue) && parsedValue > 100 && Number.isInteger(parsedValue);

  function handleChange(val) {
    setInputValue(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 100 && Number.isInteger(parsed)) {
      setMaxLength(parsed);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          Max Message Length
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Set a character limit per message. If disabled, all selected files will be placed in a single message.
        </p>
      </div>

      <Toggle
        enabled={maxLengthEnabled}
        onChange={setMaxLengthEnabled}
        label={maxLengthEnabled ? 'Enabled' : 'Disabled'}
      />

      {maxLengthEnabled && (
        <div className="space-y-2">
          <Input
            type="number"
            value={inputValue}
            onChange={handleChange}
            placeholder="e.g. 4000"
          />
          {inputValue && !isValid && (
            <div className="flex items-center gap-2 text-danger text-xs">
              <AlertCircle size={14} />
              <span>Please enter a number greater than 100</span>
            </div>
          )}
          {isValid && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <Info size={14} />
              <span>
                Messages will be split at approximately {maxLength.toLocaleString()} characters each
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
