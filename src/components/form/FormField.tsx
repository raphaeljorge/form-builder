import { memo, useMemo, useEffect, useCallback } from 'react';
import type { FieldConfig, FormValues } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';
import { useFormContext } from '../../context/FormContext';

interface FormFieldProps {
  field: FieldConfig;
  fieldId: string;
}

export const FormField = memo<FormFieldProps>(({
  field,
  fieldId
}) => {
  const { watch, setValue, formState, validateField } = useFormContext();
  
  // Memoize the value and error to prevent unnecessary re-renders
  const value = useMemo(() => watch(fieldId), [watch, fieldId]);
  const error = useMemo(() => formState.errors[fieldId]?.message, [formState.errors, fieldId]);
  
  const defaultValue = useMemo(() =>
    field.type === 'array' || field.type === 'chip' ? [] : '',
    [field.type]
  );

  // Validate on mount
  useEffect(() => {
    // Validate the field on mount if it has a value
    if (value !== undefined && value !== null && value !== '') {
      validateField(fieldId, value);
    }
  }, [fieldId, validateField, value]);

  // Memoize the change handler to prevent unnecessary re-renders
  const handleChange = useCallback((newValue: any) => {
    setValue(fieldId, newValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [fieldId, setValue]);

  // Memoize the renderer props to prevent unnecessary re-renders
  const rendererProps = useMemo(() => ({
    field,
    value: value ?? defaultValue,
    onChange: handleChange,
    error
  }), [field, value, defaultValue, handleChange, error]);

  return (
    <div className="flex-1 min-w-[200px]" data-testid={`field-${fieldId}`}>
      <FieldRenderer {...rendererProps} />
    </div>
  );
});

FormField.displayName = 'FormField';