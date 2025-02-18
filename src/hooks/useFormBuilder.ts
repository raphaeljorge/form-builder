import { 
  useForm, 
  useWatch, 
  UseFormReturn, 
  UseFormSetFocus,
  UseFormGetFieldState,
  useFieldArray,
  UseFormWatch} from 'react-hook-form';
import { 
  FormConfig, 
  FormValues, 
  BaseFormValues,
  ArrayFieldOperations,
  SetValueOptions,
  EnhancedFormState,
  baseSchema,
  ValidationError,
  FormResetOptions,
  createValidationSchema
} from '../types/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const applyMask = (value: string | any[] | undefined, mask?: string): string => {
  if (!value || !mask || Array.isArray(value)) return '';
  
  const rawValue = value.replace(/\D/g, '');
  let result = '';
  let maskIndex = 0;
  let valueIndex = 0;

  while (maskIndex < mask.length && valueIndex < rawValue.length) {
    if (mask[maskIndex] === '#') {
      result += rawValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[maskIndex];
    }
    maskIndex++;
  }

  return result;
};

export interface FormState {
  raw: FormValues;
  masked: Record<string, string | any[]>;
}

const DEFAULT_VALUES: BaseFormValues = {
  phone: '',
  ssn: '',
  country: '',
  state: '',
  password: '',
  confirmPassword: ''
};

// Initialize array fields based on config
const initializeArrayFields = (config: FormConfig) => {
  const arrayFields: Record<string, any[]> = {};
  
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      if (field.type === 'array' || field.type === 'chip') {
        arrayFields[field.id] = field.type === 'array' ? [''] : [];
      }
    });
  });

  return arrayFields;
};

// Create validation schema from config
const buildValidationSchema = (config: FormConfig) => {
  const errors: ValidationError[] = [];
  
  const addError = (path: string[], message: string) => {
    errors.push({ path, message });
  };

  // Create array fields schema
  const arrayFields: Record<string, z.ZodTypeAny> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      if (field.type === 'array' || field.type === 'chip') {
        arrayFields[field.id] = z.array(z.any());
      }
    });
  });

  // Create schema with validation
  const schema = createValidationSchema(baseSchema, arrayFields);

  return schema.superRefine((data, ctx) => {
    errors.length = 0;

    config.rows.forEach(row => {
      row.columns.forEach(field => {
        const value = data[field.id as keyof typeof data];

        // Required field validation
        if (field.required && !value) {
          addError([field.id], field.validation?.message || 'This field is required');
          return;
        }

        // Array field validation
        if (field.type === 'array' || field.type === 'chip') {
          const array = Array.isArray(value) ? value : [];
          if (field.minItems && array.length < field.minItems) {
            addError([field.id], `Minimum ${field.minItems} items required`);
          }
          if (field.maxItems && array.length > field.maxItems) {
            addError([field.id], `Maximum ${field.maxItems} items allowed`);
          }
          return;
        }

        // Masked field validation
        if (field.type === 'text' && field.mask) {
          const digitCount = field.mask.split('').filter(char => char === '#').length;
          const rawValue = String(value).replace(/\D/g, '');
          if (rawValue.length > 0 && rawValue.length !== digitCount) {
            addError([field.id], field.validation?.message || `Must be ${digitCount} digits`);
            return;
          }
        }

        // Pattern validation
        if (field.validation?.pattern && !field.mask) {
          const pattern = new RegExp(field.validation.pattern);
          if (!pattern.test(String(value))) {
            addError([field.id], field.validation.message || 'Invalid format');
          }
        }

        // Custom validation
        if (field.validation?.custom) {
          const result = field.validation.custom(String(value), data);
          if (result !== true) {
            addError([field.id], typeof result === 'string' ? result : 'Invalid value');
          }
        }
      });
    });

    // Add errors to context
    errors.forEach(error => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error.message,
        path: error.path
      });
    });
  });
};

export interface UseFormBuilderOptions {
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
  reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
  defaultValues?: Partial<FormValues>;
  shouldUnregister?: boolean;
  criteriaMode?: 'firstError' | 'all';
  shouldFocusError?: boolean;
  delayError?: number;
  context?: any;
}

export type UseFormBuilderReturn = Omit<UseFormReturn<FormValues>, 'formState' | 'watch'> & {
  state: FormState;
  formState: EnhancedFormState;
  resetForm: (options?: FormResetOptions) => void;
  setFieldFocus: UseFormSetFocus<FormValues>;
  validateField: (name: keyof FormValues) => Promise<boolean>;
  getFieldState: UseFormGetFieldState<FormValues>;
  arrayFields: Record<string, ArrayFieldOperations>;
  setValue: (name: keyof FormValues, value: any, options?: SetValueOptions) => void;
  watch: UseFormWatch<FormValues>;
};

export const useFormBuilder = (
  config: FormConfig,
  options: UseFormBuilderOptions = {}
): UseFormBuilderReturn => {
  const schema = buildValidationSchema(config);
  
  // Initialize default values with array fields
  const initialValues = {
    ...DEFAULT_VALUES,
    ...initializeArrayFields(config),
    ...options.defaultValues
  };

  const methods = useForm<FormValues>({
    mode: options.mode || 'onSubmit',
    reValidateMode: options.reValidateMode || 'onChange',
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    shouldUnregister: options.shouldUnregister,
    criteriaMode: options.criteriaMode,
    shouldFocusError: options.shouldFocusError,
    delayError: options.delayError,
    context: options.context
  });

  // Initialize array fields
  const arrayFields: Record<string, ArrayFieldOperations> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      if (field.type === 'array' || field.type === 'chip') {
        const { append, prepend, remove, swap, move, insert } = useFieldArray({
          control: methods.control,
          name: field.id
        });
        arrayFields[field.id] = {
          append,
          prepend,
          remove,
          swap,
          move,
          insert
        };
      }
    });
  });

  const watchedValues = useWatch({ 
    control: methods.control
  });
  
  // Ensure we have valid values
  const values: FormValues = {
    ...DEFAULT_VALUES,
    ...watchedValues
  };
  
  // Calculate masked values based on config
  const maskedValues: Record<string, string | any[]> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      const rawValue = values[field.id];
      if (field.type === 'text' && field.mask) {
        maskedValues[field.id] = applyMask(rawValue, field.mask);
      } else if (field.type === 'array' || field.type === 'chip') {
        maskedValues[field.id] = Array.isArray(rawValue) ? rawValue : [];
      } else {
        maskedValues[field.id] = rawValue || '';
      }
    });
  });

  // Enhanced form reset with options
  const resetForm = (options?: FormResetOptions) => {
    methods.reset(undefined, options);
  };

  // Single field validation
  const validateField = async (name: keyof FormValues) => {
    return methods.trigger(String(name));
  };

  // Enhanced setValue with additional options
  const setValue = (
    name: keyof FormValues,
    value: any,
    options?: SetValueOptions
  ) => {
    methods.setValue(String(name), value, {
      shouldValidate: options?.shouldValidate,
      shouldDirty: options?.shouldDirty,
      shouldTouch: options?.shouldTouch
    });
  };

  return {
    ...methods,
    state: {
      raw: values,
      masked: maskedValues
    },
    formState: {
      ...methods.formState,
      isSubmitSuccessful: methods.formState.isSubmitSuccessful,
      isSubmitted: methods.formState.isSubmitted,
      isValidating: methods.formState.isValidating,
      submitCount: methods.formState.submitCount,
      isValid: methods.formState.isValid
    } as EnhancedFormState,
    resetForm,
    setFieldFocus: methods.setFocus,
    validateField,
    getFieldState: methods.getFieldState,
    arrayFields,
    setValue,
    watch: methods.watch
  };
};
