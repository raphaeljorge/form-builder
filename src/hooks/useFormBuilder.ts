import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import type {
  FormBuilderOptions,
  FormBuilderReturn,
  FormConfig,
  ArrayFieldConfig,
  FieldConfig,
  ColumnConfig,
  ValidationRule,
  TextColumnConfig,
} from "../types/form";
import { applyMask } from "../components/FormBuilder/fields/TextField/TextField";

/**
 * Extract all field configurations from the form config
 */
const extractFieldsFromConfig = (config: FormConfig): Record<string, ColumnConfig> => {
  const fields: Record<string, ColumnConfig> = {};

  for (const row of config.rows) {
    for (const column of row.columns) {
      fields[column.id] = column;
    }
  }

  return fields;
};

/**
 * Find all array fields in the form config
 */
const findArrayFieldsInConfig = (config: FormConfig): ColumnConfig[] => {
  const arrayFields: ColumnConfig[] = [];

  for (const row of config.rows) {
    for (const column of row.columns) {
      if (column.type === "array" || (column.fieldConfig && column.fieldConfig.type === "array")) {
        arrayFields.push(column);
      }
    }
  }

  return arrayFields;
};

/**
 * Create validation rules for react-hook-form
 */
const createValidationRules = (
  fields: Record<string, ColumnConfig>
): Record<string, any> => {
  const rules: Record<string, any> = {};

  for (const [fieldId, fieldConfig] of Object.entries(fields)) {
    const rule: Record<string, any> = {};

    // Required validation
    if (fieldConfig.required) {
      rule.required = {
        value: true,
        message: "This field is required",
      };
    }

    // Pattern validation
    if (fieldConfig.validation?.pattern) {
      rule.pattern = {
        value: new RegExp(fieldConfig.validation.pattern),
        message: fieldConfig.validation.message || "Invalid format",
      };
    }

    // Min/max items validation for chip fields
    if (fieldConfig.type === "chip" || (fieldConfig.fieldConfig && fieldConfig.fieldConfig.type === "chip")) {
      if (fieldConfig.minItems || fieldConfig.validation?.minItems) {
        const minItems = fieldConfig.minItems || fieldConfig.validation?.minItems || 0;
        rule.validate = {
          ...rule.validate,
          minItems: (value: any[]) => {
            return (
              !value ||
              value.length >= minItems ||
              `Minimum ${minItems} items required`
            );
          },
        };
      }

      if (fieldConfig.maxItems || fieldConfig.validation?.maxItems) {
        const maxItems = fieldConfig.maxItems || fieldConfig.validation?.maxItems || Number.POSITIVE_INFINITY;
        rule.validate = {
          ...rule.validate,
          maxItems: (value: any[]) => {
            return (
              !value ||
              value.length <= maxItems ||
              `Maximum ${maxItems} items allowed`
            );
          },
        };
      }
    }

    // Custom validation
    if (fieldConfig.validation?.custom) {
      rule.validate = {
        ...rule.validate,
        custom: typeof fieldConfig.validation.custom === 'function' 
          ? fieldConfig.validation.custom 
          : fieldConfig.validation.custom.validator,
      };
    }

    // Async validation
    if (fieldConfig.validation?.async) {
      rule.validate = {
        ...rule.validate,
        async: fieldConfig.validation.async.validator,
      };
    }

    rules[fieldId] = rule;
  }

  // Add cross-field validation for password confirmation
  if (fields.password && fields.confirmPassword) {
    rules.confirmPassword = {
      ...rules.confirmPassword,
      validate: {
        ...rules.confirmPassword?.validate,
        passwordMatch: (value: string, formValues: Record<string, any>) => {
          return value === formValues.password || "Passwords do not match";
        },
      },
    };
  }

  return rules;
};

/**
 * Initialize default values for form fields
 */
const initializeDefaultValues = (
  fields: Record<string, ColumnConfig>,
  providedDefaults: Record<string, any> = {}
): Record<string, any> => {
  const defaultValues: Record<string, any> = { ...providedDefaults };

  for (const [fieldId, fieldConfig] of Object.entries(fields)) {
    if (defaultValues[fieldId] === undefined) {
      if (fieldConfig.defaultValue !== undefined) {
        defaultValues[fieldId] = fieldConfig.defaultValue;
      } else {
        // Set appropriate default values based on field type
        const fieldType = fieldConfig.type || fieldConfig.fieldConfig?.type;
        switch (fieldType) {
          case "text":
            defaultValues[fieldId] = "";
            break;
          case "select":
            defaultValues[fieldId] = "";
            break;
          case "chip":
            defaultValues[fieldId] = [];
            break;
          case "array":
            defaultValues[fieldId] = [];
            break;
          default:
            defaultValues[fieldId] = "";
        }
      }
    }
  }

  return defaultValues;
};

/**
 * Custom hook for form state management
 */
export const useFormBuilder = (
  config: FormConfig,
  options: FormBuilderOptions = {}
): FormBuilderReturn => {
  // Extract fields from config
  const fields = useMemo(() => extractFieldsFromConfig(config), [config]);
  
  // Create validation rules
  const validationRules = useMemo(() => createValidationRules(fields), [fields]);
  
  // Initialize default values
  const defaultValues = useMemo(
    () => initializeDefaultValues(fields, options.defaultValues),
    [fields, options.defaultValues]
  );

  // Initialize react-hook-form
  const {
    setValue,
    getValues,
    reset,
    handleSubmit: rhfHandleSubmit,
    formState,
    trigger,
    register,
    setError: setFieldError,
    clearErrors: clearFieldErrors,
  } = useForm({
    defaultValues,
    mode: options.mode || options.validationBehavior || "onSubmit",
  });

  // Register all fields with validation rules
  useEffect(() => {
    for (const [fieldId, rules] of Object.entries(validationRules)) {
      register(fieldId, rules);
    }
  }, [register, validationRules]);

  // Create array field operations
  const arrayFields = useMemo(() => {
    const operations: Record<string, any> = {};
    const arrayFieldConfigs = findArrayFieldsInConfig(config);

    for (const fieldConfig of arrayFieldConfigs) {
      const fieldId = fieldConfig.id;
      operations[fieldId] = {
        add: (value: any) => {
          const currentValues = getValues(fieldId) || [];
          setValue(fieldId, [...currentValues, value], {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        remove: (index: number) => {
          const currentValues = getValues(fieldId) || [];
          setValue(
            fieldId,
            currentValues.filter((_: any, i: number) => i !== index),
            { shouldDirty: true, shouldValidate: true }
          );
        },
        move: (from: number, to: number) => {
          const currentValues = getValues(fieldId) || [];
          const newValues = [...currentValues];
          const [movedItem] = newValues.splice(from, 1);
          newValues.splice(to, 0, movedItem);
          setValue(fieldId, newValues, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        update: (index: number, value: any) => {
          const currentValues = getValues(fieldId) || [];
          const newValues = [...currentValues];
          newValues[index] = value;
          setValue(fieldId, newValues, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        swap: (indexA: number, indexB: number) => {
          const currentValues = getValues(fieldId) || [];
          const newValues = [...currentValues];
          const temp = newValues[indexA];
          newValues[indexA] = newValues[indexB];
          newValues[indexB] = temp;
          setValue(fieldId, newValues, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
      };
    }

    return operations;
  }, [config, getValues, setValue]);

  // Handle form submission
  const handleSubmit = (callback?: (data: Record<string, any>) => void | Promise<void>) => {
    return (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      return rhfHandleSubmit(async (data) => {
        const transformedData = options.transform ? options.transform(data) : data;
        if (callback) {
          await callback(transformedData);
        } else if (options.onSubmit) {
          await options.onSubmit(transformedData);
        }
      })(e as any);
    };
  };

  // Validate a specific field
  const validateField = async (name: string, value?: any): Promise<boolean> => {
    if (value !== undefined) {
      setValue(name, value, { shouldValidate: true });
    }
    return trigger(name);
  };

  // Reset the form
  const resetForm = () => {
    reset(defaultValues);
  };

  // Generate masked values for fields with masks
  const getMaskedValues = (): Record<string, any> => {
    const values = getValues();
    const maskedValues: Record<string, any> = { ...values };
    
    // Apply masks to fields that have them
    for (const [fieldId, fieldConfig] of Object.entries(fields)) {
      const mask = fieldConfig.mask || (fieldConfig.fieldConfig as TextColumnConfig)?.mask;
      if ((fieldConfig.type === "text" || fieldConfig.fieldConfig?.type === "text") && mask) {
        const rawValue = values[fieldId];
        
        if (mask && rawValue) {
          maskedValues[fieldId] = applyMask(rawValue, mask);
        }
      }
    }
    
    return maskedValues;
  };

  // Convert form errors to a simple record
  const getErrorsRecord = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Convert errors to a simple format
    for (const [key, error] of Object.entries(formState.errors)) {
      if (error) {
        errors[key] = typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : String(error);
      }
    }
    
    return errors;
  };

  // Return unified API
  return {
    state: {
      isValid: formState.isValid,
      isDirty: formState.isDirty,
      errors: getErrorsRecord(),
      isSubmitted: formState.isSubmitted,
      isSubmitting: formState.isSubmitting,
      isValidating: false, // React Hook Form doesn't have this property
      isSubmitSuccessful: formState.isSubmitSuccessful,
      touchedFields: formState.touchedFields as Record<string, boolean>,
      dirtyFields: formState.dirtyFields as Record<string, boolean>,
      raw: getValues(),
    },
    formState: {
      isValid: formState.isValid,
      isDirty: formState.isDirty,
      errors: Object.entries(formState.errors).reduce((acc, [key, error]) => {
        if (error) {
          acc[key] = {
            message: typeof error === 'object' && error !== null && 'message' in error
              ? String(error.message)
              : String(error)
          };
        }
        return acc;
      }, {} as Record<string, { message: string }>),
      isSubmitted: formState.isSubmitted,
      isSubmitting: formState.isSubmitting,
      isSubmitSuccessful: formState.isSubmitSuccessful,
      dirtyFields: formState.dirtyFields as Record<string, boolean>,
      touchedFields: formState.touchedFields as Record<string, boolean>,
      raw: getValues(),
    },
    values: getValues(),
    setValue: (name: string, value: any) => {
      setValue(name, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    },
    getValue: (name: string) => getValues(name),
    reset: resetForm,
    resetForm,
    arrayFields,
    handleSubmit,
    validate: async () => {
      try {
        const result = await trigger();
        return result;
      } catch (_error) {
        return false;
      }
    },
    validateField,
    clearErrors: () => clearFieldErrors(),
    setError: (name: string, error: string) => setFieldError(name, { message: error }),
  };
};