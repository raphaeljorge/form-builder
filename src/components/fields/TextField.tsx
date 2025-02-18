import React, { memo, useCallback } from 'react';
import type { FieldProps, TextFieldConfig } from '../../types/form';
import { useDebounce } from '../../hooks/useDebounce';

interface TextFieldProps extends Omit<FieldProps, 'config'> {
  config: TextFieldConfig;
}

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
      const mask = config.mask;
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
      
      maskedValue = result;
    }
    
    onChange({
      masked: maskedValue,
      raw: rawValue
    });
  }, [config.mask, onChange]);

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
        value={value.masked}
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