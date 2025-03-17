import { 
  useForm
} from '@tanstack/react-form';
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
  createValidationSchema,
  FieldError
} from '../types/form';
import * as z from 'zod';
import { useCallback, useMemo, useState, ReactNode, useEffect, createElement, Fragment, useRef } from 'react';

/**
 * Applies a mask to a string value
 * 
 * @param value - The value to mask
 * @param mask - The mask pattern (# for digits)
 * @returns The masked value
 * 
 * @example
 * applyMask('1234567890', '(###) ###-####') // Returns '(123) 456-7890'
 */
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

/**
 * Form state data interface
 */
export interface FormStateData {
  /** Raw form values */
  raw: FormValues;
  /** Masked form values (for display) */
  masked: Record<string, string | any[]>;
}

/**
 * Default form values
 */
const DEFAULT_VALUES: BaseFormValues = {
  phone: '',
  ssn: '',
  country: '',
  state: '',
  password: '',
  confirmPassword: ''
};

/**
 * Initialize array fields based on form configuration
 * 
 * @param config - The form configuration
 * @returns An object with initialized array fields
 */
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

/**
 * Deep clone an object
 * 
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const clone = {} as T;
  Object.keys(obj as object).forEach(key => {
    (clone as any)[key] = deepClone((obj as any)[key]);
  });

  return clone;
};

/**
 * Validates a single field
 * 
 * @param fieldId - The ID of the field to validate
 * @param value - The value to validate
 * @param config - The form configuration
 * @param formValues - The current form values
 * @param updatedValues - Any updated values not yet in formValues
 * @returns An object with validation result
 */
const validateSingleField = (
  fieldId: string,
  value: any,
  config: FormConfig,
  formValues: FormValues,
  updatedValues?: Partial<FormValues>
): { isValid: boolean; error?: string } => {
  let fieldConfig: any = null;
  
  // Find the field config
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      if (field.id === fieldId) {
        fieldConfig = field;
      }
    });
  });
  
  if (!fieldConfig) {
    return { isValid: true };
  }
  
  // Create a merged values object with any updated values
  const mergedValues = {
    ...formValues,
    ...updatedValues
  };
  
  // Required field validation
  if (fieldConfig.required && (value === undefined || value === null || value === '')) {
    return { 
      isValid: false, 
      error: fieldConfig.validation?.message || 'This field is required' 
    };
  }
  
  // Array field validation
  if (fieldConfig.type === 'array' || fieldConfig.type === 'chip') {
    const array = Array.isArray(value) ? value : [];
    
    // Filter out empty values for validation
    const nonEmptyArray = array.filter(item => item !== '' && item !== null && item !== undefined);
    
    if (fieldConfig.minItems && nonEmptyArray.length < fieldConfig.minItems) {
      return { 
        isValid: false, 
        error: `Minimum ${fieldConfig.minItems} items required` 
      };
    }
    if (fieldConfig.maxItems && nonEmptyArray.length > fieldConfig.maxItems) {
      return { 
        isValid: false, 
        error: `Maximum ${fieldConfig.maxItems} items allowed` 
      };
    }
    return { isValid: true };
  }
  
  // Select field validation
  if (fieldConfig.type === 'select' && fieldConfig.required && (!value || value === '')) {
    return {
      isValid: false,
      error: fieldConfig.validation?.message || 'Please select an option'
    };
  }
  
  // Masked field validation
  if (fieldConfig.type === 'text' && fieldConfig.mask) {
    const digitCount = fieldConfig.mask.split('').filter((char: string) => char === '#').length;
    const rawValue = String(value || '').replace(/\D/g, '');
    if (rawValue.length > 0 && rawValue.length !== digitCount) {
      return { 
        isValid: false, 
        error: fieldConfig.validation?.message || `Must be ${digitCount} digits` 
      };
    }
  }
  
  // Pattern validation
  if (fieldConfig.validation?.pattern && !fieldConfig.mask) {
    const pattern = new RegExp(fieldConfig.validation.pattern);
    if (value && !pattern.test(String(value))) {
      return { 
        isValid: false, 
        error: fieldConfig.validation.message || 'Invalid format' 
      };
    }
  }
  
  // Password confirmation validation
  if (fieldId === 'confirmPassword') {
    const password = mergedValues.password;
    if (password !== value) {
      return {
        isValid: false,
        error: 'Passwords do not match'
      };
    }
  }
  
  // Custom validation
  if (fieldConfig.validation?.custom) {
    const result = fieldConfig.validation.custom(String(value || ''), mergedValues);
    if (result !== true) {
      return { 
        isValid: false, 
        error: typeof result === 'string' ? result : 'Invalid value' 
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Options for the useFormBuilder hook
 */
export interface UseFormBuilderOptions {
  /** Form validation mode */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
  /** Default form values */
  defaultValues?: Partial<FormValues>;
  /** Whether to unregister fields when they are removed */
  shouldUnregister?: boolean;
  /** How to display validation errors */
  criteriaMode?: 'firstError' | 'all';
  /** Whether to focus the first field with an error after validation */
  shouldFocusError?: boolean;
  /** Delay before showing validation errors */
  delayError?: number;
  /** Additional context for validation */
  context?: any;
}

/**
 * Return type for the useFormBuilder hook
 */
export type UseFormBuilderReturn = {
  /** Form state data */
  state: FormStateData;
  /** Enhanced form state */
  formState: EnhancedFormState;
  /** Reset the form */
  resetForm: (options?: FormResetOptions) => void;
  /** Set focus to a field */
  setFieldFocus: (name: keyof FormValues) => void;
  /** Validate a field */
  validateField: (name: keyof FormValues, value?: any) => Promise<boolean>;
  /** Array field operations */
  arrayFields: Record<string, ArrayFieldOperations>;
  /** Set a field value */
  setValue: (name: keyof FormValues, value: any, options?: SetValueOptions) => void;
  /** Watch a field value */
  watch: (name?: keyof FormValues) => any;
  /** Handle form submission */
  handleSubmit: (onSubmit: (data: FormValues) => void) => (e: React.FormEvent) => void;
  /** Form control object */
  control: any;
  /** Get form values */
  getValues: (name?: keyof FormValues) => any;
  /** Form component */
  Form: React.FC<{ children: ReactNode }>;
};

/**
 * Custom form builder hook that uses @tanstack/react-form
 * 
 * @param config - The form configuration
 * @param options - Options for the form builder
 * @returns Form builder API
 * 
 * @example
 * const { state, formState, setValue, watch, handleSubmit } = useFormBuilder(config);
 */
export const useFormBuilder = (
  config: FormConfig,
  options: UseFormBuilderOptions = {}
): UseFormBuilderReturn => {
  // Initialize default values with array fields
  const initialValues = useMemo(() => ({
    ...DEFAULT_VALUES,
    ...initializeArrayFields(config),
    ...options.defaultValues
  } as FormValues), [config, options.defaultValues]);

  // Keep a reference to the original default values
  const defaultValuesRef = useRef(deepClone(initialValues));

  // Use state to track form values and state
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [formState, setFormState] = useState<EnhancedFormState>({
    isDirty: false,
    dirtyFields: {},
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    touchedFields: {},
    errors: {},
    isValid: true,
    isLoading: false,
    disabled: false,
    validatingFields: {}
  });

  // Create a TanStack form
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async (values) => {
      return values;
    }
  });

  /**
   * Validate a single field
   * 
   * @param name - The name of the field to validate
   * @param value - The value to validate (optional)
   * @returns A promise that resolves to a boolean indicating if the field is valid
   */
  const validateField = useCallback(async (name: keyof FormValues, value?: any) => {
    setFormState(prev => ({
      ...prev,
      isValidating: true,
      validatingFields: {
        ...prev.validatingFields,
        [name]: true
      }
    }));
    
    // Use our custom validation function
    // If value is provided, use it for validation, otherwise use the current form value
    const valueToValidate = value !== undefined ? value : formValues[name];
    const result = validateSingleField(String(name), valueToValidate, config, formValues);
    
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      
      if (!result.isValid && result.error) {
        newErrors[String(name)] = {
          type: 'validation',
          message: result.error
        };
      } else {
        delete newErrors[String(name)];
      }
      
      return {
        ...prev,
        isValidating: false,
        validatingFields: {
          ...prev.validatingFields,
          [name]: false
        },
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
    
    return result.isValid;
  }, [config, formValues]);

  // Initialize array fields with proper field array handling
  const arrayFields: Record<string, ArrayFieldOperations> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      if (field.type === 'array' || field.type === 'chip') {
        arrayFields[field.id] = {
          append: (value) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = [...currentValues, value];
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          prepend: (value) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = [value, ...currentValues];
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          remove: (index) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = currentValues.filter((_: any, i: number) => i !== index);
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          swap: (indexA, indexB) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = [...currentValues];
            [newValues[indexA], newValues[indexB]] = [newValues[indexB], newValues[indexA]];
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          move: (from, to) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = [...currentValues];
            const [movedItem] = newValues.splice(from, 1);
            newValues.splice(to, 0, movedItem);
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          insert: (index, value) => {
            const currentValues = formValues[field.id] as any[] || [];
            const newValues = [...currentValues];
            newValues.splice(index, 0, value);
            
            // Update form values
            setFormValues(prev => ({
              ...prev,
              [field.id]: newValues
            }));
            
            // Mark field as dirty
            setFormState(prev => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true
              }
            }));
            
            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          }
        };
      }
    });
  });

  // Calculate masked values based on config
  const maskedValues: Record<string, string | any[]> = useMemo(() => {
    const masked: Record<string, string | any[]> = {};
    
    config.rows.forEach(row => {
      row.columns.forEach(field => {
        const rawValue = formValues[field.id];
        if (field.type === 'text' && field.mask) {
          masked[field.id] = applyMask(rawValue, field.mask);
        } else if (field.type === 'array' || field.type === 'chip') {
          masked[field.id] = Array.isArray(rawValue) ? rawValue : [];
        } else {
          masked[field.id] = rawValue || '';
        }
      });
    });
    
    return masked;
  }, [formValues, config]);

  /**
   * Reset the form to its initial state
   * 
   * @param options - Options for resetting the form
   */
  const resetForm = useCallback((options?: FormResetOptions) => {
    // Create a new values object based on the options
    const newValues = options?.keepValues 
      ? { ...formValues } 
      : deepClone(defaultValuesRef.current);
    
    // Update form values
    setFormValues(newValues);
    
    // Update form state
    setFormState(prev => {
      const newState = {
        ...prev,
        isDirty: options?.keepDirty ? prev.isDirty : false,
        dirtyFields: options?.keepDirty ? prev.dirtyFields : {},
        isSubmitted: options?.keepIsSubmitted ? prev.isSubmitted : false,
        isSubmitSuccessful: options?.keepIsSubmitted ? prev.isSubmitSuccessful : false,
        submitCount: options?.keepSubmitCount ? prev.submitCount : 0,
        touchedFields: options?.keepTouched ? prev.touchedFields : {},
        errors: options?.keepErrors ? prev.errors : {},
        isValid: options?.keepIsValid ? prev.isValid : true
      };
      
      return newState;
    });
    
    // Reset the form in TanStack Form
    form.reset();
  }, [formValues, form, defaultValuesRef]);

  /**
   * Set a field value
   * 
   * @param name - The name of the field
   * @param value - The value to set
   * @param options - Options for setting the value
   */
  const setValue = useCallback((
    name: keyof FormValues,
    value: any,
    options?: SetValueOptions
  ) => {
    // Create an update object for validation
    const updateObj = { [name]: value };
    
    // Special handling for password confirmation
    if (name === 'password' && formValues.confirmPassword) {
      // We'll need to validate confirmPassword with the new password value
      setTimeout(() => {
        validateField('confirmPassword', formValues.confirmPassword);
      }, 0);
    }
    
    // Update form values
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (options?.shouldDirty !== false) {
      setFormState(prev => ({
        ...prev,
        isDirty: true,
        dirtyFields: {
          ...prev.dirtyFields,
          [name]: true
        }
      }));
    }
    
    if (options?.shouldTouch) {
      setFormState(prev => ({
        ...prev,
        touchedFields: {
          ...prev.touchedFields,
          [name]: true
        }
      }));
    }
    
    if (options?.shouldValidate) {
      // Validate with the new value directly
      validateField(name, value);
    }
  }, [formValues, validateField]);

  /**
   * Watch a field value
   * 
   * @param name - The name of the field to watch
   * @returns The field value
   */
  const watch = useCallback((name?: keyof FormValues) => {
    if (name) {
      return formValues[name];
    }
    return formValues;
  }, [formValues]);

  /**
   * Handle form submission
   * 
   * @param onSubmit - The function to call when the form is submitted
   * @returns A function that handles the form submission event
   */
  const handleSubmit = useCallback((onSubmit: (data: FormValues) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate all fields
      const errors: Record<string, FieldError> = {};
      let isValid = true;
      
      config.rows.forEach(row => {
        row.columns.forEach(field => {
          const result = validateSingleField(field.id, formValues[field.id], config, formValues);
          if (!result.isValid && result.error) {
            errors[field.id] = {
              type: 'validation',
              message: result.error
            };
            isValid = false;
          }
        });
      });
      
      setFormState(prev => ({
        ...prev,
        errors,
        isValid
      }));
      
      if (isValid) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: true,
          isSubmitted: true,
          submitCount: prev.submitCount + 1
        }));
        
        try {
          onSubmit(formValues);
          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            isSubmitSuccessful: true
          }));
        } catch (error) {
          setFormState(prev => ({
            ...prev,
            isSubmitting: false,
            isSubmitSuccessful: false
          }));
        }
      }
    };
  }, [config, formValues]);

  /**
   * Set focus to a field
   * 
   * @param name - The name of the field to focus
   */
  const setFieldFocus = useCallback((name: keyof FormValues) => {
    const element = document.getElementById(String(name));
    if (element) {
      element.focus();
    }
  }, []);

  /**
   * Get form values
   * 
   * @param name - The name of the field to get
   * @returns The field value or all form values
   */
  const getValues = useCallback((name?: keyof FormValues) => {
    if (name) {
      return formValues[name];
    }
    return formValues;
  }, [formValues]);

  /**
   * Create a Form component to provide context
   */
  const Form = useCallback(({ children }: { children: ReactNode }) => {
    return createElement(Fragment, null, children);
  }, []);

  return {
    state: {
      raw: formValues,
      masked: maskedValues
    },
    formState,
    resetForm,
    setFieldFocus,
    validateField,
    arrayFields,
    setValue,
    watch,
    handleSubmit,
    control: form,
    getValues,
    Form
  };
};
