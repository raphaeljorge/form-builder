import React, { memo, useCallback } from 'react';
import type { FieldProps, TextFieldConfig } from '../../types/form';
import { useDebounce } from '../../hooks/useDebounce';

interface TextFieldProps extends Omit<FieldProps, 'config'> {
  config: TextFieldConfig;
}

const applyMask = (value: string, mask: string): string => {
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
  error 
}: TextFieldProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let maskedValue = inputValue;
    let rawValue = inputValue.replace(/\D/g, '');
    
    if (config.mask) {
      // Get the number of digits allowed by the mask
      const maxDigits = config.mask.split('').filter(char => char === '#').length;
      
      // Limit raw value to max digits
      rawValue = rawValue.slice(0, maxDigits);
      
      // Apply mask
      maskedValue = applyMask(rawValue, config.mask);
    }
    
    onChange({
      masked: maskedValue,
      raw: rawValue
    });
  }, [config.mask, onChange]);

  // Ensure mask is applied to displayed value
  const displayValue = config.mask && value.raw 
    ? applyMask(value.raw, config.mask)
    : value.masked;

  return (
    <div className="w-full">
      {config.label && (
        <label 
          htmlFor={config.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {config.label}
        </label>
      )}
      <input
        id={config.id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={config.placeholder}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';