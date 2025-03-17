import { memo, useMemo, useEffect } from 'react';
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
  
  const value = watch(fieldId);
  const error = formState.errors[fieldId]?.message;
  
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

  const handleChange = (newValue: any) => {
    setValue(fieldId, newValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <div className="flex-1 min-w-[200px]">
      <FieldRenderer
        field={field}
        value={value ?? defaultValue}
        onChange={handleChange}
        error={error}
      />
    </div>
  );
});

FormField.displayName = 'FormField';