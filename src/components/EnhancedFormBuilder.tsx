import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FormConfig, FieldConfig, RowWrapperProps, TextFieldConfig, SelectFieldConfig, FieldValue } from '../types/form';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';

const DefaultRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-4 mb-4 ${className}`}>{children}</div>
));

DefaultRowWrapper.displayName = 'DefaultRowWrapper';

interface EnhancedFormBuilderProps<T extends FormConfig> {
  config: T;
  onSubmit: (data: Record<string, FieldValue>) => void;
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  defaultValues?: Record<string, FieldValue>;
}

interface FormFieldProps {
  field: FieldConfig;
  config: FormConfig;
}

const FormField = memo<FormFieldProps>(({ 
  field, 
  config 
}) => {
  const { control } = useFormContext();

  return (
    <div className="flex-1 min-w-[200px]">
      <Controller
        name={field.id}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          const commonProps = {
            value: value || { masked: '', raw: '' },
            onChange: (val: FieldValue) => onChange(val),
            error: error?.message,
          };

          switch (field.type) {
            case 'text':
              return <TextField config={field as TextFieldConfig} {...commonProps} />;
            case 'select':
              return <SelectField config={field as SelectFieldConfig} {...commonProps} />;
            default:
              const _exhaustiveCheck: never = field;
              throw new Error(`Unsupported field type: ${(field as any).type}`);
          }
        }}
      />
    </div>
  );
});

FormField.displayName = 'FormField';

export const EnhancedFormBuilder = memo(<T extends FormConfig>({
  config,
  onSubmit,
  RowWrapper = DefaultRowWrapper,
}: EnhancedFormBuilderProps<T>) => {
  const { handleSubmit, formState: { isSubmitting, isDirty }, reset } = useFormContext();

  return (
    <form 
      className="w-full max-w-4xl mx-auto p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {config.rows.map((row) => {
        const WrapperComponent = row.RowWrapper || RowWrapper;
        
        return (
          <WrapperComponent
            key={row.id}
            {...row.wrapperProps}
          >
            {row.columns.map((fieldConfig) => (
              <FormField
                key={fieldConfig.id}
                field={fieldConfig}
                config={config}
              />
            ))}
          </WrapperComponent>
        );
      })}
      
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  );
});

EnhancedFormBuilder.displayName = 'EnhancedFormBuilder';

export default EnhancedFormBuilder;