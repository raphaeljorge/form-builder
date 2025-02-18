import { useForm, useWatch, UseFormReturn, FormState as RHFFormState } from 'react-hook-form';
import { FormConfig, FormValues } from '../types/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const applyMask = (value: string, mask: string): string => {
  if (!value) return '';
  
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
  masked: Record<string, string>;
}

const DEFAULT_VALUES: FormValues = {
  phone: '',
  ssn: '',
  country: ''
};

// Create validation schema from config
const createValidationSchema = (config: FormConfig) => {
  const schema = z.object({
    phone: z.string(),
    ssn: z.string(),
    country: z.string()
  });

  return schema.superRefine((data, ctx) => {
    config.rows.forEach(row => {
      row.columns.forEach(field => {
        const id = field.id as keyof FormValues;
        const value = data[id];

        // Skip empty non-required fields
        if (!value && !field.required) {
          return;
        }

        // Check required fields
        if (field.required && !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This field is required',
            path: [id]
          });
          return;
        }

        // For masked fields, only validate digit count
        if (field.type === 'text' && field.mask) {
          const digitCount = field.mask.split('').filter(char => char === '#').length;
          const rawValue = value.replace(/\D/g, '');
          
          // Only validate if there's a value and it doesn't match the expected length
          if (rawValue.length > 0 && rawValue.length !== digitCount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Must be ${digitCount} digits`,
              path: [id]
            });
            return;
          }
        }

        // Only apply pattern validation for non-masked fields
        if (field.validation?.pattern && !field.mask) {
          const pattern = new RegExp(field.validation.pattern);
          if (!pattern.test(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid format',
              path: [id]
            });
          }
        }
      });
    });
  });
};

export interface UseFormBuilderOptions {
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
  reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
  defaultValues?: Partial<FormValues>;
  shouldUnregister?: boolean;
}

export interface UseFormBuilderReturn extends Omit<UseFormReturn<FormValues>, 'formState'> {
  state: FormState;
  formState: RHFFormState<FormValues>;
}

export const useFormBuilder = (
  config: FormConfig,
  options: UseFormBuilderOptions = {}
): UseFormBuilderReturn => {
  const schema = createValidationSchema(config);
  
  const methods = useForm<FormValues>({
    mode: options.mode || 'onSubmit',
    reValidateMode: options.reValidateMode || 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      ssn: '',
      country: '',
      ...options.defaultValues
    },
    shouldUnregister: options.shouldUnregister
  });

  const watchedValues = useWatch({ control: methods.control });
  
  // Ensure we have valid values
  const values: FormValues = {
    phone: watchedValues?.phone || '',
    ssn: watchedValues?.ssn || '',
    country: watchedValues?.country || ''
  };
  
  // Calculate masked values based on config
  const maskedValues: Record<string, string> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      const id = field.id as keyof FormValues;
      const rawValue = values[id];
      if (field.type === 'text' && field.mask) {
        maskedValues[field.id] = applyMask(rawValue, field.mask);
      } else {
        maskedValues[field.id] = rawValue;
      }
    });
  });

  return {
    ...methods,
    state: {
      raw: values,
      masked: maskedValues
    }
  };
};