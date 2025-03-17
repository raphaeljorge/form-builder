import React, { memo, useCallback, useState, useEffect } from 'react';
import type { FieldProps, TextFieldConfig } from '../../types/form';
import { useDebounce } from '../../hooks/useDebounce';

interface TextFieldProps extends Omit<FieldProps, 'config'> {
  config: TextFieldConfig;
}

const applyMask = (value: string, mask: string): string => {
  if (!value) return '';
  
  const rawValue = value.replace(/\D/g, '');
  let result = '';
  let maskIndex = 0;
  let valueIndex = 0;

  while (maskIndex < mask.length && valueIndex < rawValue.length) {
    if (mask[maskIndex] === '#') {
      result += rawValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[maskIndex];
    }
    maskIndex++;
  }

  return result;
};

export const TextField = memo(({ 
  config, 
  value,
  onChange,
  error,
  disabled
}: TextFieldProps) => {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when raw value changes
  useEffect(() => {
    if (config.mask && value) {
      setDisplayValue(applyMask(value, config.mask));
    } else {
      setDisplayValue(value);
    }
  }, [value, config.mask]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let rawValue = inputValue;
    
    if (config.mask) {
      // Strip non-digits for masked inputs
      rawValue = inputValue.replace(/\D/g, '');
      
      // Get the number of digits allowed by the mask
      const maxDigits = config.mask.split('').filter(char => char === '#').length;
      
      // Limit raw value to max digits
      rawValue = rawValue.slice(0, maxDigits);
      
      // Update display value with mask
      setDisplayValue(applyMask(rawValue, config.mask));
    } else {
      setDisplayValue(inputValue);
    }
    
    // Always send raw value to form
    onChange(rawValue);
  }, [config.mask, onChange]);

  return (
    <div className="w-full">
      {config.label && (
        <label 
          htmlFor={config.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {config.label}
          {config.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={config.id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={config.placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${config.id}-error` : undefined}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
      />
      {error && (
        <p 
          id={`${config.id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';