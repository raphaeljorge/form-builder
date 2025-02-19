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
  const { control, setValue, getValues } = useFormContext<FormValues>();
  
  // Initialize field with default value if needed
  useEffect(() => {
    const currentValue = getValues(fieldId);
    if (currentValue === undefined) {
      setValue(fieldId, field.type === 'array' || field.type === 'chip' ? [] : '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }
  }, [control, fieldId, field.type, setValue, getValues]);

  return (
    <div className="flex-1 min-w-[200px]">
      <Controller
        name={fieldId}
        control={control}
        defaultValue={field.type === 'array' || field.type === 'chip' ? [] : ''}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
          <FieldRenderer
            field={field}
            value={value ?? (field.type === 'array' || field.type === 'chip' ? [] : '')}
            onChange={(newValue) => {
              onChange(newValue);
            }}
            error={error?.message}
          />
        )}
      />
    </div>
  );
});

FormField.displayName = 'FormField';