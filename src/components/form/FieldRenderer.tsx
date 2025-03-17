import React, { memo } from 'react';
import { FieldProps, isTextFieldConfig, isSelectFieldConfig, isArrayFieldConfig, isChipFieldConfig } from '../../types/form';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { ArrayField } from '../fields/ArrayField';
import { ChipField } from '../fields/ChipField';

/**
 * Renders the appropriate field component based on the field type
 */
export const FieldRenderer = memo<FieldProps>(({ 
  config, 
  value, 
  onChange, 
  error,
  disabled
}) => {
  if (isTextFieldConfig(config)) {
    return (
      <TextField 
        config={config} 
        value={value} 
        onChange={onChange} 
        error={error}
        disabled={disabled}
      />
    );
  }
  
  if (isSelectFieldConfig(config)) {
    return (
      <SelectField 
        config={config} 
        value={value} 
        onChange={onChange} 
        error={error}
        disabled={disabled}
      />
    );
  }
  
  if (isArrayFieldConfig(config)) {
    return (
      <ArrayField 
        config={config} 
        value={value} 
        onChange={onChange} 
        error={error}
        disabled={disabled}
      />
    );
  }
  
  if (isChipFieldConfig(config)) {
    return (
      <ChipField 
        config={config} 
        value={value} 
        onChange={onChange} 
        error={error}
        disabled={disabled}
      />
    );
  }
  
  // Default case - should never happen if all field types are handled
  return (
    <div className="p-4 bg-red-100 text-red-800 rounded">
      Unknown field type: {config.type}
    </div>
  );
});

FieldRenderer.displayName = 'FieldRenderer';