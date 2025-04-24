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
  minItems?: number;
  maxItems?: number;
}

/**
 * Option for select and chip fields
 */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Field option type that can be either a string or an object
 */
export type FieldOptionType = string | FieldOption;

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
  wrapperProps?: Record<string, any>;
  wrapper?: React.ComponentType<WrapperProps>;
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
  options: FieldOptionType[];
}

/**
 * Chip field configuration
 */
export interface ChipFieldConfig extends BaseFieldConfig {
  type: "chip";
  options: FieldOptionType[];
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
  fieldConfig?: FieldConfig;
  type?: "text" | "select" | "array" | "chip";
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  mask?: string;
  defaultValue?: any;
  options?: FieldOptionType[];
  minItems?: number;
  maxItems?: number;
  template?: Omit<BaseFieldConfig, "id">;
  wrapper?: React.ComponentType<WrapperProps>;
}

/**
 * Aliases for backward compatibility
 */
export type TextColumnConfig = TextFieldConfig;
export type SelectColumnConfig = SelectFieldConfig;
export type ChipColumnConfig = ChipFieldConfig;
export type ArrayColumnConfig = ArrayFieldConfig;

/**
 * Row configuration
 */
export interface RowConfig {
  id: string;
  wrapperProps?: Record<string, any>;
  columns: ColumnConfig[];
  wrapper?: React.ComponentType<WrapperProps>;
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
  mode?: "onChange" | "onBlur" | "onSubmit";
  transform?: (values: Record<string, any>) => Record<string, any>;
}

/**
 * Form builder component props
 */
export interface FormBuilderProps {
  config: FormConfig;
  isLoading?: boolean;
  children?: ReactNode;
  form?: FormBuilderReturn;
  RowWrapper?: React.ComponentType<WrapperProps>;
  ColumnWrapper?: React.ComponentType<WrapperProps>;
}

/**
 * Array field operations
 */
export interface ArrayFieldOperations {
  add: (value: any) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  update: (index: number, value: any) => void;
  swap?: (indexA: number, indexB: number) => void;
}

/**
 * Form state
 */
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string | { message: string }>;
  isSubmitted: boolean;
  isSubmitting: boolean;
  isValidating?: boolean;
  isSubmitSuccessful?: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  raw?: Record<string, any>;
}

/**
 * Form builder hook return type
 */
export interface FormBuilderReturn {
  state: FormState;
  values: Record<string, any>;
  formState?: FormState;
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  reset?: () => void;
  resetForm?: () => void;
  arrayFields: Record<string, ArrayFieldOperations>;
  handleSubmit: (callback?: (data: Record<string, any>) => void | Promise<void>) => (e?: React.FormEvent) => void;
  validate?: () => Promise<boolean>;
  validateField?: (name: string, value?: any) => Promise<boolean>;
  clearErrors?: () => void;
  setError?: (name: string, error: string) => void;
}

/**
 * Custom wrapper component props
 */
export interface WrapperProps {
  children: ReactNode;
  id: string;
  [key: string]: any;
}