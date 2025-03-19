import type { ReactNode } from "react";

/**
 * Form field option for select and chip fields
 */
export type FieldOption = string | { value: string; label: string };

/**
 * Validation rules for form fields
 */
export interface ValidationRule {
  pattern?: string;
  message?: string;
  minItems?: number;
  maxItems?: number;
  custom?: (value: any, formValues: Record<string, any>) => boolean | string;
}

/**
 * Base column configuration
 */
export interface BaseColumnConfig {
  id: string;
  type: "text" | "select" | "chip" | "array";
  wrapperProps?: Record<string, any>;
  wrapper?: React.ComponentType<WrapperProps>; // Direct reference to a wrapper component
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  defaultValue?: any;
}

/**
 * Text field column configuration
 */
export interface TextColumnConfig extends BaseColumnConfig {
  type: "text";
  mask?: string;
}

/**
 * Select field column configuration
 */
export interface SelectColumnConfig extends BaseColumnConfig {
  type: "select";
  options: FieldOption[];
}

/**
 * Chip field column configuration
 */
export interface ChipColumnConfig extends BaseColumnConfig {
  type: "chip";
  options: FieldOption[];
  minItems?: number;
  maxItems?: number;
}

/**
 * Array field column configuration
 */
export interface ArrayColumnConfig extends BaseColumnConfig {
  type: "array";
  template: Omit<BaseColumnConfig, "id">;
  minItems?: number;
  maxItems?: number;
}

/**
 * Union type for all column configurations
 */
export type ColumnConfig = 
  | TextColumnConfig 
  | SelectColumnConfig 
  | ChipColumnConfig 
  | ArrayColumnConfig;

/**
 * Row configuration
 */
export interface RowConfig {
  id: string;
  columns: ColumnConfig[];
  wrapperProps?: Record<string, any>;
  wrapper?: React.ComponentType<WrapperProps>; // Direct reference to a wrapper component
}

/**
 * Form configuration
 */
export interface FormConfig {
  rows: RowConfig[];
}

/**
 * Form state
 */
export interface FormState {
  raw: Record<string, any>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  errors: Record<string, { message: string }>;
  dirtyFields: Record<string, boolean>;
  touchedFields: Record<string, boolean>;
}

/**
 * Form builder hook options
 */
export interface FormBuilderOptions {
  defaultValues?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  mode?: "onChange" | "onBlur" | "onSubmit";
}

/**
 * Form builder hook return type
 */
export interface FormBuilderReturn {
  state: {
    raw: Record<string, any>;
    masked: Record<string, any>;
  };
  formState: FormState;
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  resetForm: () => void;
  validateField: (name: string, value?: any) => Promise<boolean>;
  handleSubmit: (callback?: (data: Record<string, any>) => void | Promise<void>) => (e?: React.FormEvent) => void;
  arrayFields: {
    [key: string]: {
      add: (value: any) => void;
      remove: (index: number) => void;
      move: (from: number, to: number) => void;
      update: (index: number, value: any) => void;
    };
  };
}

/**
 * Custom wrapper component props
 */
export interface WrapperProps {
  children: ReactNode;
  id: string;
  [key: string]: any;
}

/**
 * Form builder component props
 */
export interface FormBuilderProps {
  config: FormConfig;
  isLoading?: boolean;
  form?: FormBuilderReturn;
  RowWrapper?: React.ComponentType<WrapperProps>;
  ColumnWrapper?: React.ComponentType<WrapperProps>;
}