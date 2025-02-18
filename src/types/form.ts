import { ReactNode } from 'react';

export interface DebounceConfig {
  enabled: boolean;
  delay: number;
}

export type FieldType = 'text' | 'select';

export interface BaseFieldConfig {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  mask?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: string) => boolean | string;
  };
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

export type FieldConfig = TextFieldConfig | SelectFieldConfig;

export interface RowWrapperProps {
  children: ReactNode;
  className?: string;
}

export interface Row {
  id: string;
  columns: FieldConfig[];
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  wrapperProps?: Record<string, any>;
}

export interface FormConfig {
  rows: Row[];
}

// Simple form values interface
export interface FormValues {
  phone: string;
  ssn: string;
  country: string;
}

// Internal field value type (used by components)
export interface FieldValue {
  masked: string;
  raw: string;
}

// Internal display state (managed by components)
export interface DisplayState {
  [key: string]: FieldValue;
}

export interface FieldProps {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}