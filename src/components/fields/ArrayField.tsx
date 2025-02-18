import React from 'react';
import { ArrayFieldConfig, TextFieldConfig } from '../../types/form';
import { TextField } from './TextField';

interface ArrayFieldProps {
  config: ArrayFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  error?: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  config,
  value = [],
  onChange,
  error
}) => {
  const handleItemChange = (index: number, itemValue: string) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(newValue);
  };

  // Create text field config from template
  const createTextFieldConfig = (index: number): TextFieldConfig => {
    const template = config.template;
    if (template.type !== 'text') {
      throw new Error('Array field template must be of type text');
    }

    return {
      ...template,
      id: `${config.id}-${index}`,
      label: `${config.label} ${index + 1}`,
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
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <TextField
              config={createTextFieldConfig(index)}
              value={item}
              onChange={(newValue) => handleItemChange(index, newValue)}
              error={undefined}
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