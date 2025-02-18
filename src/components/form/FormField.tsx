import { memo, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldConfig, FormValues } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';

interface FormFieldProps {
  field: FieldConfig;
  fieldId: string;
}

export const FormField = memo<FormFieldProps>(({ 
  field,
  fieldId
}) => {
  const { control, getValues } = useFormContext<FormValues>();
  
  // Initialize field with default value if needed
  useEffect(() => {
    const currentValue = getValues(fieldId);
    if (currentValue === undefined) {
      if (field.type === 'array' || field.type === 'chip') {
        control._defaultValues[fieldId] = [];
      } else {
        control._defaultValues[fieldId] = '';
      }
    }
  }, [control, fieldId, field.type, getValues]);

  return (
    <div className="flex-1 min-w-[200px]">
      <Controller
        name={fieldId}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FieldRenderer
            field={field}
            value={value ?? (field.type === 'array' || field.type === 'chip' ? [] : '')}
            onChange={onChange}
            error={error?.message}
          />
        )}
      />
    </div>
  );
});

FormField.displayName = 'FormField';