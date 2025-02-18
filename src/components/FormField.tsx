import React, { memo } from 'react';
import type { FieldConfig, FieldValue } from '../types/form';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';

interface FormFieldProps {
  config: FieldConfig;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}

export const FormField = memo(
  ({ config, value, onChange }: FormFieldProps) => {
    switch (config.type) {
      case 'text':
        return <TextField config={config} value={value} onChange={onChange} />;
      case 'select':
        return (
          <SelectField config={config} value={value} onChange={onChange} />
        );
      default:
        return null;
    }
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.config === nextProps.config &&
      prevProps.value.raw === nextProps.value.raw &&
      prevProps.value.masked === nextProps.value.masked &&
      prevProps.onChange === nextProps.onChange
    );
  }
);
