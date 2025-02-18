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

export type ExtractFieldNames<T extends FormConfig> = T extends { rows: Array<{ columns: Array<{ id: infer ID }> }> }
  ? ID extends string
    ? ID
    : never
  : never;

export type FormState<T extends FormConfig> = {
  [K in ExtractFieldNames<T>]: FieldValue;
};

export interface FormBuilderProps<T extends FormConfig> {
  config: T;
  state: FormState<T>;
  onChange: (fieldId: ExtractFieldNames<T>, value: FieldValue) => void;
  RowWrapper?: React.ComponentType<RowWrapperProps>;
}