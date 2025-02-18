import React, { memo, useCallback } from 'react';
import type { FieldProps, SelectFieldConfig } from '../../types/form';

interface SelectFieldProps extends Omit<FieldProps, 'config'> {
  config: SelectFieldConfig;
}

export const SelectField = memo(({ 
  config, 
  value, 
  onChange,
  error 
}: SelectFieldProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange({
      masked: selectedValue,
      raw: selectedValue
    });
  }, [onChange]);

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
      <select
        id={config.id}
        value={value.raw}
        onChange={handleChange}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
      >
        {config.placeholder && (
          <option value="" disabled>
            {config.placeholder}
          </option>
        )}
        {config.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';