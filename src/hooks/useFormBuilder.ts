import { useForm } from '@tanstack/react-form';
import {
  Fragment,
  type ReactNode,
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as z from 'zod';
import {
  type ArrayFieldOperations,
  type BaseFormValues,
  type EnhancedFormState,
  type FieldError,
  type FormConfig,
  type FormResetOptions,
  type FormValues,
  type SetValueOptions,
  ValidationError,
  baseSchema,
  createValidationSchema,
} from '../types/form';

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
const applyMask = (value: string | unknown[] | undefined, mask?: string): string => {
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
  masked: Record<string, string | unknown[]>;
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
  confirmPassword: '',
};

/**
 * Initialize array fields based on form configuration
 *
 * @param config - The form configuration
 * @returns An object with initialized array fields
 */
const initializeArrayFields = (config: FormConfig) => {
  const arrayFields: Record<string, unknown[]> = {};

  for (const row of config.rows) {
    for (const field of row.columns) {
      if (field.type === 'array' || field.type === 'chip') {
        arrayFields[field.id] = field.type === 'array' ? [''] : [];
      }
    }
  }

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
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const clone = {} as T;
  for (const key of Object.keys(obj as object)) {
    (clone as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key]);
  }

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
  value: unknown,
  config: FormConfig,
  formValues: FormValues,
  updatedValues?: Partial<FormValues>
): { isValid: boolean; error?: string } => {
  let fieldConfig: any = null;

  // Find the field config
  for (const row of config.rows) {
    for (const field of row.columns) {
      if (field.id === fieldId) {
        fieldConfig = field;
      }
    }
  }

  if (!fieldConfig) {
    return { isValid: true };
  }

  // Create a merged values object with any updated values
  const mergedValues = {
    ...formValues,
    ...updatedValues,
  };

  // Required field validation
  if (fieldConfig.required) {
    // For select fields, we need special handling
    if (fieldConfig.type === 'select') {
      // Only consider it empty if it's explicitly undefined, null, or empty string
      // Any other value (including 0, false, etc.) is considered valid
      const isEmptyValue = value === undefined || value === null || value === '';

      // For select fields, check if there's a default value in the form values
      // If there is, consider it valid regardless of the current value
      const hasDefaultValue =
        formValues[fieldConfig.id] !== undefined &&
        formValues[fieldConfig.id] !== null &&
        formValues[fieldConfig.id] !== '';

      if (isEmptyValue && !hasDefaultValue) {
        return {
          isValid: false,
          error: fieldConfig.validation?.message || 'Please select an option',
        };
      }

      // If we get here, the select field is valid
      return { isValid: true };
    }
    // For other field types
    const isEmptyValue = value === undefined || value === null || value === '';

    if (isEmptyValue) {
      return {
        isValid: false,
        error: fieldConfig.validation?.message || 'This field is required',
      };
    }
  }

  // Array field validation
  if (fieldConfig.type === 'array' || fieldConfig.type === 'chip') {
    const array = Array.isArray(value) ? value : [];

    // Filter out empty values for validation
    const nonEmptyArray = array.filter(
      (item) => item !== '' && item !== null && item !== undefined
    );

    if (fieldConfig.minItems && nonEmptyArray.length < fieldConfig.minItems) {
      return {
        isValid: false,
        error: `Minimum ${fieldConfig.minItems} items required`,
      };
    }
    if (fieldConfig.maxItems && nonEmptyArray.length > fieldConfig.maxItems) {
      return {
        isValid: false,
        error: `Maximum ${fieldConfig.maxItems} items allowed`,
      };
    }
    return { isValid: true };
  }

  // Additional select field validation can go here if needed

  // Masked field validation
  if (fieldConfig.type === 'text' && fieldConfig.mask) {
    const digitCount = fieldConfig.mask.split('').filter((char: string) => char === '#').length;
    const rawValue = String(value || '').replace(/\D/g, '');
    if (rawValue.length > 0 && rawValue.length !== digitCount) {
      return {
        isValid: false,
        error: fieldConfig.validation?.message || `Must be ${digitCount} digits`,
      };
    }
  }

  // Pattern validation
  if (fieldConfig.validation?.pattern && !fieldConfig.mask) {
    const pattern = new RegExp(fieldConfig.validation.pattern);
    if (value && !pattern.test(String(value))) {
      return {
        isValid: false,
        error: fieldConfig.validation.message || 'Invalid format',
      };
    }
  }

  // Password confirmation validation
  if (fieldId === 'confirmPassword') {
    const password = mergedValues.password;
    if (password !== value) {
      return {
        isValid: false,
        error: 'Passwords do not match',
      };
    }
  }

  // Custom validation
  if (fieldConfig.validation?.custom) {
    const result = fieldConfig.validation.custom(String(value || ''), mergedValues);
    if (result !== true) {
      return {
        isValid: false,
        error: typeof result === 'string' ? result : 'Invalid value',
      };
    }
  }

  return { isValid: true };
};

/**
 * Options for the useFormBuilder hook
 */
export interface UseFormBuilderOptions {
  /**
   * Form validation mode
   * - onSubmit: Validate only on form submission
   * - onChange: Validate when field values change
   * - onBlur: Validate when fields lose focus
   * - onTouched: Validate only fields that have been touched
   * - all: Validate on all events
   * - none: No automatic validation (manual only)
   */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all' | 'none';
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
  context?: unknown;
  /** Debounce time for form submission in milliseconds */
  submitDebounce?: number;
  /** Whether to enable field-level dirty checking */
  enableFieldLevelDirtyChecking?: boolean;
  /** Whether to enable field transformation */
  enableFieldTransformation?: boolean;
  /** Whether to enable automatic revalidation of dependent fields */
  enableAutomaticDependencyRevalidation?: boolean;
  /** Whether to enable performance optimizations */
  enablePerformanceOptimizations?: boolean;
  /** Form-level validation function */
  formValidation?: (values: FormValues) => Record<string, string> | null;
}

/**
 * Return type for the useFormBuilder hook
 */
export type UseFormBuilderReturn = {
  /** Set form state directly */
  setFormState: (updater: (prev: EnhancedFormState) => EnhancedFormState) => void;
  /** Form state data */
  state: FormStateData;
  /** Enhanced form state */
  formState: EnhancedFormState;
  /** Reset the form */
  resetForm: (options?: FormResetOptions) => void;
  /** Reset a specific field */
  resetField: (name: keyof FormValues, options?: FieldResetOptions) => void;
  /** Set focus to a field */
  setFieldFocus: (name: keyof FormValues) => void;
  /** Validate a field */
  validateField: (name: keyof FormValues, value?: unknown) => Promise<boolean>;
  /** Array field operations */
  arrayFields: Record<string, ArrayFieldOperations>;
  /** Set a field value */
  setValue: (name: keyof FormValues, value: unknown, options?: SetValueOptions) => void;
  /** Watch a field value */
  watch: (name?: keyof FormValues) => unknown;
  /** Handle form submission */
  handleSubmit: (onSubmit: (data: FormValues) => void) => (e: React.FormEvent) => void;
  /** Form control object */
  control: unknown;
  /** Get form values */
  getValues: (name?: keyof FormValues) => unknown;
  /** Form component */
  Form: React.FC<{ children: ReactNode }>;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  /** Set loading state for specific fields */
  setFieldLoading: (fieldId: keyof FormValues, isLoading: boolean) => void;
  /** Get field dependencies */
  getFieldDependencies: (fieldId: keyof FormValues) => Array<keyof FormValues>;
  /** Check if a field should be displayed based on conditions */
  shouldDisplayField: (fieldId: keyof FormValues) => boolean;
  /** Transform a field value */
  transformField: (
    fieldId: keyof FormValues,
    value: unknown,
    direction: 'input' | 'output'
  ) => unknown;
  /** Compose with another form */
  composeWith: (otherForm: UseFormBuilderReturn) => UseFormBuilderReturn;
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
/**
 * Field reset options
 */
export interface FieldResetOptions {
  /** Whether to keep the field's error state */
  keepError?: boolean;
  /** Whether to keep the field's dirty state */
  keepDirty?: boolean;
  /** Whether to keep the field's value */
  keepValue?: boolean;
  /** Whether to keep the field's touched state */
  keepTouched?: boolean;
  /** Whether to enable field-level dirty checking */
  enableFieldLevelDirtyChecking?: boolean;
}

/**
 * Field transformation configuration
 */
export interface FieldTransformation {
  /** Transform value before storing in form state */
  input?: (value: unknown) => unknown;
  /** Transform value before returning from form state */
  output?: (value: unknown) => unknown;
}

/**
 * Field condition configuration
 */
export interface FieldCondition {
  /** Fields this condition depends on */
  dependsOn: Array<keyof FormValues>;
  /** Function to determine if field should be displayed */
  shouldDisplay: (values: FormValues) => boolean;
}

// Debounce function for form submission
const debounce = <F extends (...args: unknown[]) => unknown>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

export const useFormBuilder = (
  config: FormConfig,
  options: UseFormBuilderOptions = {}
): UseFormBuilderReturn => {
  // Field transformations
  const [fieldTransformations, setFieldTransformations] = useState<
    Record<string, FieldTransformation>
  >({});

  // Field conditions
  const [fieldConditions, setFieldConditions] = useState<Record<string, FieldCondition>>({});

  // Field dependencies
  const [fieldDependencies, setFieldDependencies] = useState<
    Record<string, Array<keyof FormValues>>
  >({});

  // Initialize default values with array fields
  const initialValues = useMemo(() => {
    const values = {
      ...DEFAULT_VALUES,
      ...initializeArrayFields(config),
      ...options.defaultValues,
    } as FormValues;

    // Apply input transformations to default values if enabled
    if (options.enableFieldTransformation) {
      for (const row of config.rows) {
        for (const field of row.columns) {
          if (field.transform && values[field.id] !== undefined) {
            const transformation = field.transform as FieldTransformation;
            if (transformation.input) {
              values[field.id] = transformation.input(values[field.id]);
            }
          }
        }
      }
    }

    // Ensure select fields with default values are properly handled
    for (const row of config.rows) {
      for (const field of row.columns) {
        if (field.type === 'select') {
          // If there's a default value in options, use it
          if (options.defaultValues && options.defaultValues[field.id] !== undefined) {
            values[field.id] = options.defaultValues[field.id];
          }
          // If there's no default value but there are options, use the first option's value
          else if (field.options && field.options.length > 0 && !field.placeholder) {
            values[field.id] = field.options[0].value;
          }
        }
      }
    }

    // Pre-validate select fields with default values to clear any errors
    for (const row of config.rows) {
      for (const field of row.columns) {
        if (field.type === 'select') {
          // For select fields, if there's a value, mark it as pre-validated
          if (
            values[field.id] !== undefined &&
            values[field.id] !== null &&
            values[field.id] !== ''
          ) {
            // Mark this field as pre-validated to avoid validation errors
            values[`__prevalidated_${field.id}`] = true;
          }
          // If there's no value but there are options, use the first option's value
          else if (field.options && field.options.length > 0 && !field.placeholder) {
            values[field.id] = field.options[0].value;
            values[`__prevalidated_${field.id}`] = true;
          }
        }
      }
    }

    return values;
  }, [config, options.defaultValues, options.enableFieldTransformation]);

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
    validatingFields: {},
    loadingFields: {},
  });

  // Track field-level dirty state if enabled
  const [_dirtyFields, setDirtyFields] = useState<Record<string, boolean>>(
    options.enableFieldLevelDirtyChecking ? {} : formState.dirtyFields
  );

  // Create a TanStack form
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      // We'll use this to track submission in TanStack Form
      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        isSubmitted: true,
        submitCount: prev.submitCount + 1,
      }));

      return value;
    },
  });

  // Extract field dependencies from config
  useEffect(() => {
    if (options.enableAutomaticDependencyRevalidation) {
      const dependencies: Record<string, Array<keyof FormValues>> = {};

      // Extract dependencies from validation rules
      for (const row of config.rows) {
        for (const field of row.columns) {
          if (field.validation?.deps) {
            // For fields that are depended on, track which fields depend on them
            for (const dep of field.validation.deps) {
              if (!dependencies[dep]) {
                dependencies[dep] = [];
              }
              dependencies[dep].push(field.id as keyof FormValues);
            }
          }

          // Also check for conditional display dependencies
          if (field.condition?.dependsOn) {
            setFieldConditions((prev) => ({
              ...prev,
              [field.id]: field.condition as FieldCondition,
            }));

            // For fields that are depended on for display conditions
            for (const dep of field.condition.dependsOn) {
              if (!dependencies[dep]) {
                dependencies[dep] = [];
              }
              if (!dependencies[dep].includes(field.id as keyof FormValues)) {
                dependencies[dep].push(field.id as keyof FormValues);
              }
            }
          }

          // Check for field transformations
          if (field.transform && options.enableFieldTransformation) {
            setFieldTransformations((prev) => ({
              ...prev,
              [field.id]: field.transform as FieldTransformation,
            }));
          }
        }
      }

      setFieldDependencies(dependencies);
    }
  }, [config, options.enableAutomaticDependencyRevalidation, options.enableFieldTransformation]);

  /**
   * Set loading state for the entire form
   *
   * @param isLoading - Whether the form is loading
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isLoading,
    }));
  }, []);

  /**
   * Set loading state for a specific field
   *
   * @param fieldId - The ID of the field
   * @param isLoading - Whether the field is loading
   */
  const setFieldLoading = useCallback((fieldId: keyof FormValues, isLoading: boolean) => {
    setFormState((prev) => ({
      ...prev,
      loadingFields: {
        ...prev.loadingFields,
        [fieldId]: isLoading,
      },
    }));
  }, []);

  /**
   * Validate a single field
   *
   * @param name - The name of the field to validate
   * @param value - The value to validate (optional)
   * @returns A promise that resolves to a boolean indicating if the field is valid
   */
  const validateField = useCallback(
    async (name: keyof FormValues, value?: unknown) => {
      setFormState((prev) => ({
        ...prev,
        isValidating: true,
        validatingFields: {
          ...prev.validatingFields,
          [name]: true,
        },
      }));

      // Get the field configuration
      const fieldConfig = config.rows
        .flatMap((row) => row.columns)
        .find((field) => field.id === name);

      // If value is provided, use it for validation, otherwise use the current form value
      const valueToValidate = value !== undefined ? value : formValues[name];

      // Skip validation for fields that shouldn't be displayed
      if (fieldConfig?.condition && !shouldDisplayField(name)) {
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          delete newErrors[String(name)];

          return {
            ...prev,
            isValidating: false,
            validatingFields: {
              ...prev.validatingFields,
              [name]: false,
            },
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });

        return true;
      }

      // Check if this is a pre-validated field
      if (formValues[`__prevalidated_${name}`]) {
        // Clear any existing errors for this field
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          delete newErrors[String(name)];

          return {
            ...prev,
            isValidating: false,
            validatingFields: {
              ...prev.validatingFields,
              [name]: false,
            },
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });

        return true;
      }

      // Skip validation for select fields that already have a value
      if (
        fieldConfig?.type === 'select' &&
        valueToValidate !== undefined &&
        valueToValidate !== null &&
        valueToValidate !== ''
      ) {
        // Clear any existing errors for this field
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          delete newErrors[String(name)];

          return {
            ...prev,
            isValidating: false,
            validatingFields: {
              ...prev.validatingFields,
              [name]: false,
            },
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });

        return true;
      }
      // Apply transformations if needed
      const transformedValue =
        options?.enableFieldTransformation === true
          ? transformField(name, valueToValidate, 'input')
          : valueToValidate;

      const result = validateSingleField(String(name), transformedValue, config, formValues);

      setFormState((prev) => {
        const newErrors = { ...prev.errors };

        if (!result.isValid && result.error) {
          newErrors[String(name)] = {
            type: 'validation',
            message: result.error,
          };
        } else {
          delete newErrors[String(name)];
        }

        return {
          ...prev,
          isValidating: false,
          validatingFields: {
            ...prev.validatingFields,
            [name]: false,
          },
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });

      return result.isValid;
    },
    [config, formValues, options?.enableFieldTransformation]
  );

  // Initialize array fields with proper field array handling
  const arrayFields: Record<string, ArrayFieldOperations> = {};
  for (const row of config.rows) {
    for (const field of row.columns) {
      if (field.type === 'array' || field.type === 'chip') {
        arrayFields[field.id] = {
          append: (value: unknown) => {
            const currentValues = (formValues[field.id] as unknown[]) || [];
            const newValues = [...currentValues, value];

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          prepend: (value: unknown) => {
            const currentValues = (formValues[field.id] as any[]) || [];
            const newValues = [value, ...currentValues];

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          remove: (index: number) => {
            const currentValues = (formValues[field.id] as any[]) || [];
            const newValues = currentValues.filter((_, i: number) => i !== index);

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          swap: (indexA: number, indexB: number) => {
            const currentValues = (formValues[field.id] as any[]) || [];
            const newValues = [...currentValues];
            [newValues[indexA], newValues[indexB]] = [newValues[indexB], newValues[indexA]];

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          move: (from: number, to: number) => {
            const currentValues = (formValues[field.id] as any[]) || [];
            const newValues = [...currentValues];
            const [movedItem] = newValues.splice(from, 1);
            newValues.splice(to, 0, movedItem);

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
          insert: (index: number, value: unknown) => {
            const currentValues = (formValues[field.id] as any[]) || [];
            const newValues = [...currentValues];
            newValues.splice(index, 0, value);

            // Update form values
            setFormValues((prev) => ({
              ...prev,
              [field.id]: newValues,
            }));

            // Mark field as dirty
            setFormState((prev) => ({
              ...prev,
              isDirty: true,
              dirtyFields: {
                ...prev.dirtyFields,
                [field.id]: true,
              },
            }));

            // Validate with the new value
            validateField(field.id as keyof FormValues, newValues);
          },
        };
      }
    }
  }

  // Calculate masked values based on config
  const maskedValues: Record<string, string | unknown[]> = useMemo(() => {
    const masked: Record<string, string | any[]> = {};

    for (const row of config.rows) {
      for (const field of row.columns) {
        const rawValue = formValues[field.id];
        if (field.type === 'text' && field.mask) {
          masked[field.id] = applyMask(rawValue, field.mask);
        } else if (field.type === 'array' || field.type === 'chip') {
          masked[field.id] = Array.isArray(rawValue) ? rawValue : [];
        } else {
          masked[field.id] = rawValue || '';
        }
      }
    }

    return masked;
  }, [formValues, config]);

  /**
   * Reset a specific field to its initial state
   *
   * @param name - The name of the field to reset
   * @param options - Options for resetting the field
   */
  const resetField = useCallback((name: keyof FormValues, options?: FieldResetOptions) => {
    // Get the default value for this field
    const defaultValue = defaultValuesRef.current[name];

    // Update form values for this field
    setFormValues((prev) => ({
      ...prev,
      [name]: options?.keepValue ? prev[name] : defaultValue,
    }));

    // Update form state for this field
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      const newDirtyFields = { ...prev.dirtyFields };
      const newTouchedFields = { ...prev.touchedFields };

      if (!options?.keepError) {
        delete newErrors[String(name)];
      }

      if (!options?.keepDirty) {
        delete newDirtyFields[String(name)];
      }

      if (!options?.keepTouched) {
        delete newTouchedFields[String(name)];
      }

      return {
        ...prev,
        errors: newErrors,
        dirtyFields: newDirtyFields,
        touchedFields: newTouchedFields,
        isValid: Object.keys(newErrors).length === 0,
      };
    });

    // If field-level dirty checking is enabled, update that too
    if (options?.enableFieldLevelDirtyChecking) {
      setDirtyFields((prev) => {
        const newDirtyFields = { ...prev };
        if (!options?.keepDirty) {
          delete newDirtyFields[String(name)];
        }
        return newDirtyFields;
      });
    }
  }, []);

  /**
   * Reset the form to its initial state
   *
   * @param options - Options for resetting the form
   */
  const resetForm = useCallback(
    (options?: FormResetOptions) => {
      // Create a new values object based on the options
      const newValues = options?.keepValues
        ? { ...formValues }
        : deepClone(defaultValuesRef.current);

      // Update form values
      setFormValues(newValues);

      // Update form state
      setFormState((prev) => {
        const newState = {
          ...prev,
          isDirty: options?.keepDirty ? prev.isDirty : false,
          dirtyFields: options?.keepDirty ? prev.dirtyFields : {},
          isSubmitted: options?.keepIsSubmitted ? prev.isSubmitted : false,
          isSubmitSuccessful: options?.keepIsSubmitted ? prev.isSubmitSuccessful : false,
          submitCount: options?.keepSubmitCount ? prev.submitCount : 0,
          touchedFields: options?.keepTouched ? prev.touchedFields : {},
          errors: options?.keepErrors ? prev.errors : {},
          isValid: options?.keepIsValid ? prev.isValid : true,
          isLoading: false,
          loadingFields: {},
        };

        return newState;
      });

      // Reset the form in TanStack Form
      form.reset();
    },
    [formValues, form]
  );

  /**
   * Get dependencies for a field
   *
   * @param fieldId - The ID of the field
   * @returns An array of field IDs that depend on this field
   */
  const getFieldDependencies = useCallback(
    (fieldId: keyof FormValues) => {
      return fieldDependencies[fieldId as string] || [];
    },
    [fieldDependencies]
  );

  /**
   * Check if a field should be displayed based on its conditions
   *
   * @param fieldId - The ID of the field
   * @returns Whether the field should be displayed
   */
  const shouldDisplayField = useCallback(
    (fieldId: keyof FormValues) => {
      const condition = fieldConditions[fieldId as string];
      if (!condition) return true;

      return condition.shouldDisplay(formValues);
    },
    [fieldConditions, formValues]
  );

  /**
   * Transform a field value
   *
   * @param fieldId - The ID of the field
   * @param value - The value to transform
   * @param direction - The direction of transformation ('input' or 'output')
   * @returns The transformed value
   */
  const transformField = useCallback(
    (fieldId: keyof FormValues, value: unknown, direction: 'input' | 'output') => {
      const transformation = fieldTransformations[fieldId as string];
      if (!transformation) return value;

      if (direction === 'input' && transformation.input) {
        return transformation.input(value);
      }

      if (direction === 'output' && transformation.output) {
        return transformation.output(value);
      }

      return value;
    },
    [fieldTransformations]
  );

  /**
   * Set a field value
   *
   * @param name - The name of the field
   * @param value - The value to set
   * @param options - Options for setting the value
   */
  /* biome-ignore lint/correctness/useExhaustiveDependencies: complex dependencies */
  const setValue = useCallback(
    (name: keyof FormValues, value: unknown, options?: SetValueOptions) => {
      // Apply input transformation if enabled
      const transformedValue =
        options?.enableFieldTransformation === true ? transformField(name, value, 'input') : value;

      // Create an update object for validation
      const _updateObj = { [name]: transformedValue };

      // Special handling for password confirmation
      if (name === 'password' && formValues.confirmPassword) {
        // We'll need to validate confirmPassword with the new password value
        setTimeout(() => {
          validateField('confirmPassword', formValues.confirmPassword);
        }, 0);
      }

      // Check if this is a select field
      const fieldConfig = config.rows
        .flatMap((row) => row.columns)
        .find((field) => field.id === String(name));
      const isSelectField = fieldConfig?.type === 'select';
      const hasValue =
        transformedValue !== undefined && transformedValue !== null && transformedValue !== '';

      // Special handling for select fields with values
      if (isSelectField && hasValue) {
        // For select fields with values, mark them as pre-validated
        setFormValues((prev) => ({
          ...prev,
          [name]: transformedValue,
          [`__prevalidated_${String(name)}`]: true,
        }));

        // Clear any validation errors for this field
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          delete newErrors[String(name)];

          return {
            ...prev,
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });
      } else {
        // Normal update for other fields
        setFormValues((prev) => ({
          ...prev,
          [name]: transformedValue,
        }));
      }

      if (options?.shouldDirty !== false) {
        setFormState((prev) => ({
          ...prev,
          isDirty: true,
          dirtyFields: {
            ...prev.dirtyFields,
            [name]: true,
          },
        }));
      }

      if (options?.shouldTouch) {
        setFormState((prev) => ({
          ...prev,
          touchedFields: {
            ...prev.touchedFields,
            [name]: true,
          },
        }));
      }

      // Get the validation mode - first check setValue options, then fall back to global hook options
      const validationMode = options?.mode !== undefined ? options.mode : options?.mode;

      // Determine if we should validate based on the validation mode
      const shouldValidateBasedOnMode =
        // Explicit validation request in options
        options?.shouldValidate ||
        // Or validation mode is set to validate on change
        validationMode === 'onChange' ||
        validationMode === 'all';

      // Only validate if explicitly requested or if the mode is onChange/all
      if (shouldValidateBasedOnMode && validationMode !== 'none') {
        // Validate with the new value directly
        validateField(name, transformedValue);

        // If automatic dependency revalidation is enabled, validate dependent fields
        if (options?.enableAutomaticDependencyRevalidation === true) {
          const dependentFields = getFieldDependencies(name);
          for (const depField of dependentFields) {
            validateField(depField, formValues[depField]);
          }
        }
      }

      // Update field-level dirty state if enabled
      if (options?.enableFieldLevelDirtyChecking === true && options?.shouldDirty !== false) {
        setDirtyFields((prev) => ({
          ...prev,
          [name]: true,
        }));
      }
    },
    [formValues, validateField, getFieldDependencies, transformField]
  );

  /**
   * Compose with another form
   *
   * @param otherForm - Another form instance to compose with
   * @returns A combined form instance
   */
  /* biome-ignore lint/correctness/useExhaustiveDependencies: complex dependencies */
  const composeWith = useCallback(
    (otherForm: UseFormBuilderReturn) => {
      // This is a simplified implementation of form composition
      // A more complete implementation would merge all form state and methods

      // Merge form values
      const mergedValues = {
        ...formValues,
        ...otherForm.state.raw,
      };

      // Create a new form state
      const mergedFormState = {
        ...formState,
        errors: {
          ...formState.errors,
          ...otherForm.formState.errors,
        },
        dirtyFields: {
          ...formState.dirtyFields,
          ...otherForm.formState.dirtyFields,
        },
        touchedFields: {
          ...formState.touchedFields,
          ...otherForm.formState.touchedFields,
        },
        isValid: formState.isValid && otherForm.formState.isValid,
      };

      // Return a new form instance with merged state
      // This is a simplified version - a real implementation would need to merge all methods too
      return {
        state: {
          raw: mergedValues,
          masked: {
            ...maskedValues,
            ...otherForm.state.masked,
          },
        },
        formState: mergedFormState,
        // Include all the methods from the current form
        setFormState,
        resetForm,
        resetField,
        setFieldFocus,
        validateField,
        arrayFields,
        setValue,
        watch,
        handleSubmit,
        control: form,
        getValues,
        Form,
        setLoading,
        setFieldLoading,
        getFieldDependencies,
        shouldDisplayField,
        transformField,
        composeWith,
      };
    },
    [formValues, formState, maskedValues]
  );

  /**
   * Watch a field value
   *
   * @param name - The name of the field to watch
   * @returns The field value
   */
  const watch = useCallback(
    (name?: keyof FormValues) => {
      if (name) {
        // Apply output transformation if enabled
        return options?.enableFieldTransformation === true
          ? transformField(name, formValues[name], 'output')
          : formValues[name];
      }

      // If watching all values and transformations are enabled, transform all values
      if (options?.enableFieldTransformation === true) {
        const transformedValues = { ...formValues };
        for (const fieldId of Object.keys(fieldTransformations)) {
          transformedValues[fieldId] = transformField(
            fieldId as keyof FormValues,
            formValues[fieldId],
            'output'
          );
        }
        return transformedValues;
      }

      return formValues;
    },
    [formValues, options?.enableFieldTransformation, transformField, fieldTransformations]
  );

  /**
   * Handle form submission
   *
   * @param onSubmit - The function to call when the form is submitted
   * @returns A function that handles the form submission event
   */
  const handleSubmit = useCallback(
    (onSubmit: (data: FormValues) => void) => {
      // Create a debounced version of the submission handler if debounce is enabled
      const debouncedSubmit = options.submitDebounce
        ? debounce(onSubmit as any, options.submitDebounce)
        : onSubmit;

      return async (e: React.FormEvent) => {
        e.preventDefault();

        // Set form to submitting state and mark as submitted
        setFormState((prev) => ({
          ...prev,
          isSubmitting: true,
          isSubmitted: true,
          submitCount: prev.submitCount + 1,
        }));

        // Only validate on submit if the mode is onSubmit, all, or not specified
        const shouldValidateOnSubmit =
          options.mode === undefined || options.mode === 'onSubmit' || options.mode === 'all';

        if (!shouldValidateOnSubmit) {
          // Skip validation and just submit the form
          try {
            const submissionValues =
              options?.enableFieldTransformation === true
                ? Object.keys(formValues).reduce((acc, key) => {
                    acc[key] = transformField(key as keyof FormValues, formValues[key], 'output');
                    return acc;
                  }, {} as FormValues)
                : formValues;

            // Show loading state for a short time, then submit
            setTimeout(async () => {
              try {
                // Call the submit function
                await debouncedSubmit(submissionValues);

                // Set success state immediately
                setFormState((prev) => ({
                  ...prev,
                  isSubmitting: false,
                  isSubmitted: true,
                  isSubmitSuccessful: true,
                }));
              } catch (_error) {
                // Handle errors
                setTimeout(() => {
                  setFormState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    isSubmitSuccessful: false,
                  }));
                }, 300);
              }
            }, 100);

            return;
          } catch (_error) {
            // Set error state after a short delay
            setTimeout(() => {
              setFormState((prev) => ({
                ...prev,
                isSubmitting: false,
                isSubmitSuccessful: false,
              }));
            }, 300);
            return;
          }
        }

        // Validate all fields
        const errors: Record<string, FieldError> = {};
        let isValid = true;

        for (const row of config.rows) {
          for (const field of row.columns) {
            // Skip validation for fields that shouldn't be displayed
            if (field.condition && !shouldDisplayField(field.id as keyof FormValues)) {
              continue;
            }

            // Get the value, applying any transformations if needed
            const fieldValue =
              options?.enableFieldTransformation === true
                ? transformField(field.id as keyof FormValues, formValues[field.id], 'input')
                : formValues[field.id];

            // Special handling for select fields with default values
            const isSelectField = field.type === 'select';
            const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

            // Always skip validation for select fields that have any value
            const shouldSkipValidation = isSelectField && hasValue;

            // Only validate if we shouldn't skip validation
            if (!shouldSkipValidation) {
              // Validate the field
              const result = validateSingleField(field.id, fieldValue, config, formValues);
              if (!result.isValid && result.error) {
                errors[field.id] = {
                  type: 'validation',
                  message: result.error,
                };
                isValid = false;
              }
            }
          }
        }

        setFormState((prev) => ({
          ...prev,
          errors,
          isValid,
          // If there are validation errors, stop the submitting state
          isSubmitting: isValid ? prev.isSubmitting : false,
        }));

        // Perform form-level validation if provided
        let formLevelErrors: Record<string, string> | null = null;
        if (options.formValidation) {
          formLevelErrors = options.formValidation(formValues);

          if (formLevelErrors) {
            // Add form-level errors to the form state
            const newErrors = { ...errors };

            for (const [fieldId, errorMessage] of Object.entries(formLevelErrors)) {
              newErrors[fieldId] = {
                type: 'validation',
                message: errorMessage,
              };
            }

            setFormState((prev) => ({
              ...prev,
              errors: newErrors,
              isValid: false,
              // If there are form-level validation errors, stop the submitting state
              isSubmitting: false,
            }));

            isValid = false;
          }
        }

        if (isValid) {
          try {
            // Call the user's onSubmit handler
            // Apply output transformations to all values if enabled
            const submissionValues =
              options?.enableFieldTransformation === true
                ? Object.keys(formValues).reduce((acc, key) => {
                    acc[key] = transformField(key as keyof FormValues, formValues[key], 'output');
                    return acc;
                  }, {} as FormValues)
                : formValues;

            // Show loading state for a short time, then submit
            setTimeout(async () => {
              try {
                // Call the submit function
                await debouncedSubmit(submissionValues);

                // Set success state immediately
                setFormState((prev) => ({
                  ...prev,
                  isSubmitting: false,
                  isSubmitted: true,
                  isSubmitSuccessful: true,
                }));
              } catch (_error) {
                // Handle errors
                setTimeout(() => {
                  setFormState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    isSubmitSuccessful: false,
                  }));
                }, 300);
              }
            }, 100);
          } catch (_error) {
            // Set error state after a short delay
            setTimeout(() => {
              setFormState((prev) => ({
                ...prev,
                isSubmitting: false,
                isSubmitSuccessful: false,
              }));
            }, 300);
          }
        }
      };
    },
    [
      config,
      formValues,
      shouldDisplayField,
      transformField,
      options.mode,
      options.formValidation,
      options.submitDebounce,
      options?.enableFieldTransformation,
    ]
  );

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
  const getValues = useCallback(
    (name?: keyof FormValues) => {
      if (name) {
        // Apply output transformation if enabled
        return options?.enableFieldTransformation === true
          ? transformField(name, formValues[name], 'output')
          : formValues[name];
      }

      // If getting all values and transformations are enabled, transform all values
      if (options?.enableFieldTransformation === true) {
        const transformedValues = { ...formValues };
        for (const fieldId of Object.keys(fieldTransformations)) {
          transformedValues[fieldId] = transformField(
            fieldId as keyof FormValues,
            formValues[fieldId],
            'output'
          );
        }
        return transformedValues;
      }

      return formValues;
    },
    [formValues, options?.enableFieldTransformation, transformField, fieldTransformations]
  );

  /**
   * Create a Form component to provide context
   */
  const Form = useCallback(({ children }: { children: ReactNode }) => {
    return createElement(Fragment, null, children);
  }, []);

  // Apply performance optimizations if enabled
  const memoizedState = useMemo(
    () => ({
      raw: formValues,
      masked: maskedValues,
    }),
    [formValues, maskedValues]
  );

  const memoizedFormState = useMemo(() => formState, [formState]);

  // No validation on mount as per user request
  // Validation will only happen on user interaction or form submission

  return {
    state:
      options?.enablePerformanceOptimizations === true
        ? memoizedState
        : {
            raw: formValues,
            masked: maskedValues,
          },
    formState: options?.enablePerformanceOptimizations === true ? memoizedFormState : formState,
    setFormState, // Expose the setFormState function
    resetForm,
    resetField,
    setFieldFocus,
    validateField,
    arrayFields,
    setValue,
    watch,
    handleSubmit,
    control: form,
    getValues,
    Form,
    setLoading,
    setFieldLoading,
    getFieldDependencies,
    shouldDisplayField,
    transformField,
    composeWith,
  };
};
