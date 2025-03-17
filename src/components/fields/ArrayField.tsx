import React from 'react';
import { ArrayFieldConfig, TextFieldConfig } from '../../types/form';
import { TextField } from './TextField';
import { useFormContext } from '../../context/FormContext';

interface ArrayFieldProps {
  config: ArrayFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  error?: string;
  disabled?: boolean;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  config,
  value = [],
  onChange,
  error,
  disabled
}) => {
  const { setValue, getValues } = useFormContext();

  const handleItemChange = (index: number, itemValue: string) => {
    const currentValues = [...(getValues(config.id) || [])];
    currentValues[index] = itemValue;
    
    // Update form state
    setValue(config.id, currentValues, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
    
    // Notify parent component
    onChange(currentValues);
  };

  // Create text field config from template
  const createTextFieldConfig = (index: number): TextFieldConfig => {
    // Support for dynamic templates based on index
    const template = typeof config.template === 'function'
      ? config.template(index)
      : config.template;
      
    if (template.type !== 'text') {
      throw new Error('Array field template must be of type text');
    }

    return {
      ...template,
      id: `${config.id}-${index}`,
      label: template.label || `${config.label} ${index + 1}`,
      type: 'text'
    };
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {(Array.isArray(value) ? value : []).map((item, index) => (
          <div key={`${config.id}-${index}`} className="flex gap-2">
            <TextField
              config={createTextFieldConfig(index)}
              value={item}
              onChange={(newValue) => handleItemChange(index, newValue)}
              error={undefined}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};