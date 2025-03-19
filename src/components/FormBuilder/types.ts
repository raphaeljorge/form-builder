import type { ReactNode } from "react";

/**
 * Common validation rules for form fields
 */
export interface ValidationRule {
  required?: { value: boolean; message: string };
  pattern?: string;
  message?: string;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  validate?: "email" | "number" | string;
  custom?: {
    validator: (value: any, formValues?: Record<string, any>) => boolean | string;
  };
  async?: {
    validator: (value: any) => Promise<boolean | string>;
    debounce?: number;
  };
  dependencies?: string[];
}

/**
 * Option for select and chip fields
 */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Base field configuration properties
 */
export interface BaseFieldConfig {
  id: string;
  type: "text" | "select" | "array" | "chip";
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  mask?: string;
  defaultValue?: any;
  showSkeleton?: boolean;
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: "text";
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options: (string | FieldOption)[];
}

/**
 * Chip field configuration
 */
export interface ChipFieldConfig extends BaseFieldConfig {
  type: "chip";
  options: (string | FieldOption)[];
  minItems?: number;
  maxItems?: number;
}

/**
 * Array field configuration
 */
export interface ArrayFieldConfig extends BaseFieldConfig {
  type: "array";
  template: Omit<BaseFieldConfig, "id">;
  minItems?: number;
  maxItems?: number;
}

/**
 * Union type for all field configurations
 */
export type FieldConfig = 
  | TextFieldConfig 
  | SelectFieldConfig 
  | ChipFieldConfig 
  | ArrayFieldConfig;

/**
 * Column configuration
 */
export interface ColumnConfig {
  id: string;
  wrapperProps?: Record<string, any>;
  fieldConfig: FieldConfig;
}

/**
 * Row configuration
 */
export interface RowConfig {
  id: string;
  wrapperProps?: Record<string, any>;
  columns: ColumnConfig[];
}

/**
 * Form configuration
 */
export interface FormConfig {
  rows: RowConfig[];
}

/**
 * Form builder hook options
 */
export interface FormBuilderOptions {
  defaultValues?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  validationBehavior?: "onChange" | "onBlur" | "onSubmit";
  transform?: (values: Record<string, any>) => Record<string, any>;
}

/**
 * Form builder component props
 */
export interface FormBuilderProps {
  config: FormConfig;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Array field operations
 */
export interface ArrayFieldOperations {
  add: (value: any) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  update: (index: number, value: any) => void;
  swap: (indexA: number, indexB: number) => void;
}

/**
 * Form state
 */
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  isSubmitted: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
}

/**
 * Form builder hook return type
 */
export interface FormBuilderReturn {
  state: FormState;
  values: Record<string, any>;
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  reset: () => void;
  arrayFields: Record<string, ArrayFieldOperations>;
  handleSubmit: (callback?: (data: Record<string, any>) => void | Promise<void>) => (e?: React.FormEvent) => void;
  validate: () => Promise<boolean>;
  clearErrors: () => void;
  setError: (name: string, error: string) => void;
}