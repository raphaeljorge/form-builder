import React, { memo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { 
  FormConfig, 
  FieldConfig, 
  RowWrapperProps, 
  TextFieldConfig, 
  SelectFieldConfig,
  ArrayFieldConfig,
  FormValues
} from '../types/form';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { ArrayField } from './fields/ArrayField';

const DefaultRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-4 mb-4 ${className}`}>{children}</div>
));

DefaultRowWrapper.displayName = 'DefaultRowWrapper';

interface EnhancedFormBuilderProps<T extends FormConfig> {
  config: T;
  onSubmit: (data: FormValues) => void;
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  defaultValues?: Partial<FormValues>;
}

interface FormFieldProps {
  field: FieldConfig;
  config: FormConfig;
}

// Type guards
const isTextField = (field: FieldConfig): field is TextFieldConfig => field.type === 'text';
const isSelectField = (field: FieldConfig): field is SelectFieldConfig => field.type === 'select';
const isArrayField = (field: FieldConfig): field is ArrayFieldConfig => field.type === 'array';

const FormField = memo<FormFieldProps>(({ 
  field, 
  config 
}) => {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="flex-1 min-w-[200px]">
      <Controller
        name={`${field.id}`}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          const errorMessage = error?.message;

          if (isTextField(field)) {
            return (
              <TextField
                config={field}
                value={value?.toString() || ''}
                onChange={onChange}
                error={errorMessage}
              />
            );
          }

          if (isSelectField(field)) {
            return (
              <SelectField
                config={field}
                value={value?.toString() || ''}
                onChange={onChange}
                error={errorMessage}
              />
            );
          }

          if (isArrayField(field)) {
            return (
              <ArrayField
                config={field}
                value={Array.isArray(value) ? value : []}
                onChange={onChange}
                error={errorMessage}
              />
            );
          }

          // At this point, field should be never type
          // But we'll handle it explicitly for type safety
          const unknownField = field as { type: string };
          throw new Error(`Unsupported field type: ${unknownField.type}`);
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
  const { handleSubmit, formState: { isSubmitting, isDirty }, reset } = useFormContext<FormValues>();

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