import { useForm, useWatch, UseFormReturn } from 'react-hook-form';
import { FormConfig, FormValues } from '../types/form';

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

export interface UseFormBuilderReturn extends UseFormReturn<FormValues> {
  state: FormState;
}

export const useFormBuilder = (
  config: FormConfig,
  defaultValues: Partial<FormValues> = {}
): UseFormBuilderReturn => {
  const methods = useForm<FormValues>({
    defaultValues: {
      ...DEFAULT_VALUES,
      ...defaultValues
    }
  });

  const watchedValues = useWatch({ control: methods.control });
  
  // Ensure we always have valid values
  const values: FormValues = {
    ...DEFAULT_VALUES,
    ...watchedValues
  };

  // Calculate masked values based on config
  const maskedValues: Record<string, string> = {};
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      const rawValue = values[field.id as keyof FormValues];
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