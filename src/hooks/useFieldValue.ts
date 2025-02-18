import { useMemo } from 'react';
import type { FormConfig, FormState, FieldValue } from '../types/form';

export function useFieldValue<T extends FormConfig>(
  state: FormState<T>,
  fieldId: keyof FormState<T>,
  type: 'masked' | 'raw' = 'raw'
): string {
  return useMemo(() => {
    const fieldValue = state[fieldId] as FieldValue;
    if (!fieldValue) return '';
    return type in fieldValue ? fieldValue[type] : '';
  }, [state, fieldId, type]);
}