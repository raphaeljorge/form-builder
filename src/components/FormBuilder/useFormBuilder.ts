import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMemo } from "react";
import { z } from "zod";
import type { FormEvent } from "react";
import type {
  FormBuilderOptions,
  FormBuilderReturn,
  FormConfig,
  ArrayFieldConfig,
  FieldConfig,
} from "./types";

/**
 * Extract all field configurations from the form config
 */
const extractFieldsFromConfig = (config: FormConfig): Record<string, FieldConfig> => {
  const fields: Record<string, FieldConfig> = {};

  for (const row of config.rows) {
    for (const column of row.columns) {
      fields[column.fieldConfig.id] = column.fieldConfig;
    }
  }

  return fields;
};

/**
 * Find all array fields in the form config
 */
const findArrayFieldsInConfig = (config: FormConfig): ArrayFieldConfig[] => {
  const arrayFields: ArrayFieldConfig[] = [];

  for (const row of config.rows) {
    for (const column of row.columns) {
      if (column.fieldConfig.type === "array") {
        arrayFields.push(column.fieldConfig as ArrayFieldConfig);
      }
    }
  }

  return arrayFields;
};

/**
 * Custom hook for form state management
 */
export const useFormBuilder = (
  config: FormConfig,
  options: FormBuilderOptions = {}
): FormBuilderReturn => {
  // Create schema from field configurations
  const createSchema = () => {
    const schema: Record<string, any> = {};
    const fields = extractFieldsFromConfig(config);
    
    for (const [fieldId, fieldConfig] of Object.entries(fields)) {
      if (fieldConfig.type === "array") {
        // Handle array fields
        const arrayConfig = fieldConfig as ArrayFieldConfig;
        const itemSchema = z.any();
        schema[fieldId] = z.array(itemSchema)
          .min(arrayConfig.minItems || 0, `Minimum ${arrayConfig.minItems} items required`)
          .max(arrayConfig.maxItems || Number.POSITIVE_INFINITY, `Maximum ${arrayConfig.maxItems} items allowed`);
      } else if (fieldConfig.required) {
        schema[fieldId] = z.string().min(1, `${fieldConfig.label || fieldId} is required`);
      } else {
        schema[fieldId] = z.any().optional();
      }
    }
    
    return z.object(schema);
  };

  // Initialize TanStack form
  const form = useForm({
    defaultValues: options.defaultValues || {},
    onSubmit: async (values) => {
      if (options.onSubmit) {
        const transformedData = options.transform ? options.transform(values) : values;
        await options.onSubmit(transformedData);
      }
      return values;
    },
    validatorAdapter: zodValidator,
  });

  // Create array field operations
  const arrayFields = useMemo(() => {
    const operations: Record<string, any> = {};
    const arrayFieldConfigs = findArrayFieldsInConfig(config);

    for (const fieldConfig of arrayFieldConfigs) {
      operations[fieldConfig.id] = {
        add: (value: any) => {
          const currentValues = form.getFieldValue(fieldConfig.id) || [];
          form.setFieldValue(fieldConfig.id, [...currentValues, value]);
        },
        remove: (index: number) => {
          const currentValues = form.getFieldValue(fieldConfig.id) || [];
          form.setFieldValue(
            fieldConfig.id,
            currentValues.filter((_: any, i: number) => i !== index)
          );
        },
        move: (from: number, to: number) => {
          const currentValues = form.getFieldValue(fieldConfig.id) || [];
          const newValues = [...currentValues];
          const [movedItem] = newValues.splice(from, 1);
          newValues.splice(to, 0, movedItem);
          form.setFieldValue(fieldConfig.id, newValues);
        },
        update: (index: number, value: any) => {
          const currentValues = form.getFieldValue(fieldConfig.id) || [];
          const newValues = [...currentValues];
          newValues[index] = value;
          form.setFieldValue(fieldConfig.id, newValues);
        },
        swap: (indexA: number, indexB: number) => {
          const currentValues = form.getFieldValue(fieldConfig.id) || [];
          const newValues = [...currentValues];
          const temp = newValues[indexA];
          newValues[indexA] = newValues[indexB];
          newValues[indexB] = temp;
          form.setFieldValue(fieldConfig.id, newValues);
        },
      };
    }

    return operations;
  }, [config, form]);

  // Convert form errors to a simple record
  const getErrorsRecord = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Simplified error handling
    if (form.state.errors && Array.isArray(form.state.errors)) {
      for (const error of form.state.errors) {
        if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
          const path = Array.isArray(error.path) ? error.path.join('.') : String(error.path);
          const message = String(error.message);
          errors[path] = message;
        }
      }
    }
    
    return errors;
  };

  // Return unified API
  return {
    state: {
      isValid: form.state.isValid,
      isDirty: Boolean(form.state.isDirty),
      errors: getErrorsRecord(),
      isSubmitted: form.state.isSubmitted,
      isSubmitting: form.state.isSubmitting,
      isValidating: form.state.isValidating,
      touchedFields: form.state.touchedFields || {},
      dirtyFields: form.state.dirtyFields || {},
    },
    values: form.state.values,
    setValue: (name: string, value: any) => form.setFieldValue(name, value),
    getValue: (name: string) => form.getFieldValue(name),
    reset: () => form.reset(),
    arrayFields,
    handleSubmit: (callback) => {
      return (e?: FormEvent) => {
        if (e) {
          e.preventDefault();
        }
        
        // Manual form submission
        form.handleSubmit(async (values) => {
          if (callback) {
            const transformedData = options.transform ? options.transform(values) : values;
            await callback(transformedData);
          }
        })();
      };
    },
    validate: async () => {
      try {
        await form.validate();
        return form.state.isValid;
      } catch (error) {
        return false;
      }
    },
    clearErrors: () => {
      // Simplified error clearing
      const errors = getErrorsRecord();
      for (const fieldName of Object.keys(errors)) {
        try {
          // @ts-ignore - TanStack Form API might vary
          form.setFieldError?.(fieldName, undefined);
        } catch (error) {
          console.error("Error clearing field errors:", error);
        }
      }
    },
    setError: (name: string, error: string) => {
      try {
        // @ts-ignore - TanStack Form API might vary
        form.setFieldError?.(name, error);
      } catch (err) {
        console.error("Error setting field error:", err);
      }
    },
  };
};