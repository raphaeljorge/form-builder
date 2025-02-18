import React, { memo } from 'react';
import type { 
  FieldConfig, 
  TextFieldConfig, 
  SelectFieldConfig,
  ArrayFieldConfig,
  ChipFieldConfig
} from '../../types/form';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { ArrayField } from '../fields/ArrayField';
import { ChipField } from '../fields/ChipField';

// Type guards
const isTextField = (field: FieldConfig): field is TextFieldConfig => field.type === 'text';
const isSelectField = (field: FieldConfig): field is SelectFieldConfig => field.type === 'select';
const isArrayField = (field: FieldConfig): field is ArrayFieldConfig => field.type === 'array';
const isChipField = (field: FieldConfig): field is ChipFieldConfig => field.type === 'chip';

interface FieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FieldRenderer = memo<FieldRendererProps>(({ 
  field, 
  value, 
  onChange, 
  error 
}) => {
  if (isTextField(field)) {
    return (
      <TextField
        config={field}
        value={value?.toString() || ''}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (isSelectField(field)) {
    return (
      <SelectField
        config={field}
        value={value?.toString() || ''}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (isArrayField(field)) {
    return (
      <ArrayField
        config={field}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (isChipField(field)) {
    return (
      <ChipField
        config={field}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        error={error}
      />
    );
  }

  const unknownField = field as { type: string };
  throw new Error(`Unsupported field type: ${unknownField.type}`);
});

FieldRenderer.displayName = 'FieldRenderer';