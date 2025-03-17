import * as z from 'zod';

// Base form schema
export const baseSchema = z.object({
  phone: z.string().optional(),
  ssn: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional()
});

// Helper to create a validation schema with array fields
export const createValidationSchema = (
  baseSchema: z.ZodObject<any>,
  arrayFields: Record<string, z.ZodTypeAny>
) => {
  return baseSchema.extend(arrayFields);
};

// Infer the type from the schema
export type FormSchema = ReturnType<typeof createValidationSchema>;
export type BaseFormValues = z.infer<typeof baseSchema>;
export type FormValues = BaseFormValues & Record<string, any>;

// Field validation error
export interface ValidationError {
  path: string[];
  message: string;
}

export interface FieldError {
  type: string;
  message: string;
}

// Form field types
export type FieldType = 'text' | 'select' | 'array' | 'chip';

// Base field configuration
export interface BaseFieldConfig {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
    custom?: (value: string, formValues: FormValues) => boolean | string;
    deps?: Array<keyof FormValues>; // Fields this validation depends on
  };
  condition?: {
    dependsOn: Array<keyof FormValues>; // Fields this condition depends on
    shouldDisplay: (values: FormValues) => boolean; // Function to determine if field should be displayed
  };
  transform?: {
    input?: (value: any) => any; // Transform value before storing in form state
    output?: (value: any) => any; // Transform value before returning from form state
  };
}

// Text field configuration
export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
  mask?: string;
}

// Select field option
export interface SelectOption {
  value: string;
  label: string;
}

// Select field configuration
export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: SelectOption[];
}

// Array field configuration
export interface ArrayFieldConfig extends BaseFieldConfig {
  type: 'array';
  template: TextFieldConfig | ((index: number) => TextFieldConfig); // Support for dynamic templates
  minItems?: number;
  maxItems?: number;
}

// Chip field configuration
export interface ChipFieldConfig extends BaseFieldConfig {
  type: 'chip';
  options: string[];
  minItems?: number;
  maxItems?: number;
}

// Union type for all field configurations
export type FieldConfig = TextFieldConfig | SelectFieldConfig | ArrayFieldConfig | ChipFieldConfig;

// Form row configuration
export interface FormRow {
  id: string;
  columns: FieldConfig[];
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  wrapperProps?: Record<string, any>;
}

// Form configuration
export interface FormConfig {
  rows: FormRow[];
}

// Props for row wrapper components
export interface RowWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// Props for field components
export interface FieldProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

// Array field operations
export interface ArrayFieldOperations {
  append: (value: any) => void;
  prepend: (value: any) => void;
  remove: (index: number) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, value: any) => void;
}

// Options for setValue
export interface SetValueOptions {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
  enableFieldTransformation?: boolean;
  enableAutomaticDependencyRevalidation?: boolean;
  enableFieldLevelDirtyChecking?: boolean;
  /** Validation mode for this specific setValue call */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all' | 'none';
}

// Field transformation interface
export interface FieldTransformation {
  input?: (value: any) => any;
  output?: (value: any) => any;
}

// Field condition interface
export interface FieldCondition {
  dependsOn: Array<keyof FormValues>;
  shouldDisplay: (values: FormValues) => boolean;
}

// Field reset options
export interface FieldResetOptions {
  keepError?: boolean;
  keepDirty?: boolean;
  keepValue?: boolean;
  keepTouched?: boolean;
  enableFieldLevelDirtyChecking?: boolean;
}

// Options for form reset
export interface FormResetOptions {
  keepErrors?: boolean;
  keepDirty?: boolean;
  keepValues?: boolean;
  keepIsSubmitted?: boolean;
  keepTouched?: boolean;
  keepIsValid?: boolean;
  keepSubmitCount?: boolean;
}

// Enhanced form state
export interface EnhancedFormState {
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
  isLoading: boolean;
  disabled: boolean;
  validatingFields: Record<string, boolean>;
  loadingFields?: Record<string, boolean>;
}

// Type guard functions
export const isTextFieldConfig = (config: FieldConfig): config is TextFieldConfig => 
  config.type === 'text';

export const isSelectFieldConfig = (config: FieldConfig): config is SelectFieldConfig => 
  config.type === 'select';

export const isArrayFieldConfig = (config: FieldConfig): config is ArrayFieldConfig => 
  config.type === 'array';

export const isChipFieldConfig = (config: FieldConfig): config is ChipFieldConfig => 
  config.type === 'chip';
