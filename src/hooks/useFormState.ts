import { useCallback, useState, useMemo, useRef } from 'react';
import type { FormConfig, FormState, FieldValue } from '../types/form';

const emptyValue: FieldValue = { masked: '', raw: '' };

const createInitialState = <T extends FormConfig>(config: T): FormState<T> => {
  const initialState: Record<string, FieldValue> = {};
  
  config.rows.forEach(row => {
    row.columns.forEach(field => {
      initialState[field.id] = emptyValue;
    });
  });
  
  return initialState as FormState<T>;
};

export function useFormState<T extends FormConfig>(config: T) {
  // Memoize initial state creation
  const initialState = useMemo(() => createInitialState(config), [config]);
  const [state, setState] = useState<FormState<T>>(initialState);
  
  // Use ref for stable identity of state object between renders
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleChange = useCallback((id: keyof FormState<T>, value: FieldValue) => {
    setState(prev => {
      // Only update if value actually changed
      if (
        prev[id].raw === value.raw &&
        prev[id].masked === value.masked
      ) {
        return prev;
      }
      return { ...prev, [id]: value };
    });
  }, []);

  return {
    state: stateRef.current,
    onChange: handleChange
  };
}