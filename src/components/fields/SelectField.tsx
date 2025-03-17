import React, { memo } from 'react';
import type { FieldProps, SelectFieldConfig } from '../../types/form';

interface SelectFieldProps extends Omit<FieldProps, 'config'> {
  config: SelectFieldConfig;
}

export const SelectField = memo(({
  config,
  value,
  onChange,
  error,
  disabled
}: SelectFieldProps) => {
  // Force validation on mount to clear any errors
  // for select fields with default values
  React.useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      // Trigger a change event with the current value to force validation
      onChange(value);
    }
  }, []);
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
      <select
        id={config.id}
        value={value === undefined || value === null ? '' : value}
        onChange={(e) => {
          // Ensure the value is properly set, even if it's the default option
          const selectedValue = e.target.value;
          onChange(selectedValue);
        }}
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

SelectField.displayName = 'SelectField';