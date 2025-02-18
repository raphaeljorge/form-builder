import { ReactNode } from 'react';
import { FieldError, FormState as RHFFormState } from 'react-hook-form';
import * as z from 'zod';

export interface DebounceConfig {
  enabled: boolean;
  delay: number;
}

export type FieldType = 'text' | 'select' | 'array';

export interface ValidationConfig {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: string) => boolean | string;
  required?: boolean;
  validate?: {
    [key: string]: (value: any) => boolean | string | Promise<boolean | string>;
  };
  deps?: string[];
  message?: string;
}

export interface BaseFieldConfig {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  mask?: string;
  required?: boolean;
  validation?: ValidationConfig;
  shouldUnregister?: boolean;
  defaultValue?: any;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  type: 'array';
  template: FieldConfig;
  minItems?: number;
  maxItems?: number;
}

export type FieldConfig = TextFieldConfig | SelectFieldConfig | ArrayFieldConfig;

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

// Base form values type
export interface BaseFormValues {
  phone: string;
  ssn: string;
  country: string;
}

// Extended form values type
export type FormValues = BaseFormValues & {
  [key: string]: string | any[] | undefined;
}

// Base schema
const baseSchemaShape = {
  phone: z.string(),
  ssn: z.string(),
  country: z.string()
} as const;

export const baseSchema = z.object(baseSchemaShape);
export type BaseSchema = typeof baseSchema;

// Type for the complete schema
export type FormSchema = z.ZodType<FormValues>;

// Helper to create a schema that matches FormValues
export const createValidationSchema = (schema: BaseSchema, extraFields: Record<string, z.ZodTypeAny>) => {
  const extendedSchema = z.object({
    ...schema.shape,
    ...extraFields
  });
  return extendedSchema.passthrough() as FormSchema;
};

// Internal field value type with support for arrays
export type FieldValue = {
  masked: string;
  raw: string;
} | {
  masked: any[];
  raw: any[];
}

// Enhanced display state with array support
export interface DisplayState {
  [key: string]: FieldValue;
}

// Enhanced field state
export interface FieldState {
  isDirty: boolean;
  isTouched: boolean;
  isValid: boolean;
  error?: FieldError;
}

// Enhanced form state
export interface EnhancedFormState extends RHFFormState<FormValues> {
  isDirty: boolean;
  dirtyFields: Record<string, boolean>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  touchedFields: Record<string, boolean>;
  errors: Record<string, FieldError>;
  isValid: boolean;
}

// Field props with array support
export interface FieldProps {
  config: FieldConfig;
  value: string | any[];
  onChange: (value: any) => void;
  error?: string;
}

// Array field operations
export interface ArrayFieldOperations {
  append: (value: any) => void;
  prepend: (value: any) => void;
  insert: (index: number, value: any) => void;
  remove: (index: number) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
}

// Enhanced setValue options
export interface SetValueOptions {
  shouldValidate?: boolean;
  shouldDirty?: boolean;
  shouldTouch?: boolean;
}

// Watch options
export interface WatchOptions {
  defaultValue?: any;
  disabled?: boolean;
  exact?: boolean;
}

// Validation error
export interface ValidationError {
  path: string[];
  message: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form reset options
export type FormResetOptions = {
  keepErrors?: boolean;
  keepDirty?: boolean;
  keepValues?: boolean;
  keepDefaultValues?: boolean;
  keepIsSubmitted?: boolean;
  keepTouched?: boolean;
  keepIsValid?: boolean;
  keepSubmitCount?: boolean;
};