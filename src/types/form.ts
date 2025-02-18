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

export interface FieldValue {
  masked: string;
  raw: string;
}

export interface FieldProps {
  config: FieldConfig;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export interface FormValues {
  phone: string;
  ssn: string;
  country: string;
}

export interface DisplayValues {
  [key: string]: FieldValue;
}

export interface FormData {
  values: FormValues;
  display: DisplayValues;
}