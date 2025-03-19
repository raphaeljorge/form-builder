import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import type {
  FormBuilderOptions,
  FormBuilderReturn,
  FormConfig,
  ArrayColumnConfig,
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
const findArrayFieldsInConfig = (config: FormConfig): ArrayColumnConfig[] => {
  const arrayFields: ArrayColumnConfig[] = [];

  for (const row of config.rows) {
    for (const column of row.columns) {
      if (column.type === "array") {
        arrayFields.push(column as ArrayColumnConfig);
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
    if (fieldConfig.type === "chip") {
      if (fieldConfig.minItems) {
        rule.validate = {
          ...rule.validate,
          minItems: (value: any[]) => {
            return (
              !value ||
              value.length >= (fieldConfig.minItems || 0) ||
              `Minimum ${fieldConfig.minItems} items required`
            );
          },
        };
      }

      if (fieldConfig.maxItems) {
        rule.validate = {
          ...rule.validate,
          maxItems: (value: any[]) => {
            return (
              !value ||
              value.length <= (fieldConfig.maxItems || Number.POSITIVE_INFINITY) ||
              `Maximum ${fieldConfig.maxItems} items allowed`
            );
          },
        };
      }
    }

    // Custom validation
    if (fieldConfig.validation?.custom) {
      rule.validate = {
        ...rule.validate,
        custom: fieldConfig.validation.custom,
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
        switch (fieldConfig.type) {
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
  } = useForm({
    defaultValues,
    mode: options.mode || "onSubmit",
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
      operations[fieldConfig.id] = {
        add: (value: any) => {
          const currentValues = getValues(fieldConfig.id) || [];
          setValue(fieldConfig.id, [...currentValues, value], {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        remove: (index: number) => {
          const currentValues = getValues(fieldConfig.id) || [];
          setValue(
            fieldConfig.id,
            currentValues.filter((_: any, i: number) => i !== index),
            { shouldDirty: true, shouldValidate: true }
          );
        },
        move: (from: number, to: number) => {
          const currentValues = getValues(fieldConfig.id) || [];
          const newValues = [...currentValues];
          const [movedItem] = newValues.splice(from, 1);
          newValues.splice(to, 0, movedItem);
          setValue(fieldConfig.id, newValues, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        // Add update method for updating a specific item in the array
        update: (index: number, value: any) => {
          const currentValues = getValues(fieldConfig.id) || [];
          const newValues = [...currentValues];
          newValues[index] = value;
          setValue(fieldConfig.id, newValues, {
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
        if (callback) {
          await callback(data);
        } else if (options.onSubmit) {
          await options.onSubmit(data);
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
  const getMaskedValues = () => {
    const values = getValues();
    const maskedValues: Record<string, any> = { ...values };
    
    // Apply masks to fields that have them
    for (const [fieldId, fieldConfig] of Object.entries(fields)) {
      if (fieldConfig.type === "text" && (fieldConfig as TextColumnConfig).mask) {
        const mask = (fieldConfig as TextColumnConfig).mask;
        const rawValue = values[fieldId];
        
        if (mask && rawValue) {
          maskedValues[fieldId] = applyMask(rawValue, mask);
        }
      }
    }
    
    return maskedValues;
  };

  // Return unified API
  return {
    state: {
      raw: getValues(),
      masked: getMaskedValues(),
    },
    formState: {
      raw: getValues(),
      isDirty: formState.isDirty,
      isValid: formState.isValid,
      isSubmitted: formState.isSubmitted,
      isSubmitting: formState.isSubmitting,
      isSubmitSuccessful: formState.isSubmitSuccessful,
      // Convert errors to expected format
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
      dirtyFields: formState.dirtyFields as Record<string, boolean>,
      touchedFields: formState.touchedFields as Record<string, boolean>,
    },
    setValue: (name: string, value: any) => {
      // Use react-hook-form's setValue with options to trigger validation and mark as dirty
      setValue(name, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      
      // Update the masked values when a field value changes
      // This is handled automatically by getMaskedValues() when state.masked is accessed
    },
    getValue: (name: string) => getValues(name),
    resetForm,
    validateField,
    handleSubmit,
    arrayFields,
  };
};