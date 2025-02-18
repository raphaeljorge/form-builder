import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldConfig, FormValues } from '../../types/form';
import { FieldRenderer } from '../form/FieldRenderer';

interface FormFieldProps {
  field: FieldConfig;
  fieldId: string;
}

export const FormField = memo<FormFieldProps>(({ 
  field,
  fieldId
}) => {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="flex-1 min-w-[200px]">
      <Controller
        name={fieldId}
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FieldRenderer
            field={field}
            value={value}
            onChange={onChange}
            error={error?.message}
          />
        )}
      />
    </div>
  );
});

FormField.displayName = 'FormField';