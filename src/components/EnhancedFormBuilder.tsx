import React, { memo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FormConfig, FormValues, RowWrapperProps } from '../types/form';
import { DefaultRowWrapper } from './form/DefaultRowWrapper';
import { FormRow } from './form/FormRow';
import { FormActions } from './form/FormActions';

interface EnhancedFormBuilderProps<T extends FormConfig> {
  config: T;
  onSubmit: (data: FormValues) => void;
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  defaultValues?: Partial<FormValues>;
}

export const EnhancedFormBuilder = memo(<T extends FormConfig>({
  config,
  onSubmit,
  RowWrapper = DefaultRowWrapper,
}: EnhancedFormBuilderProps<T>) => {
  const { handleSubmit, formState: { isSubmitting, isDirty }, reset } = useFormContext<FormValues>();

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <form 
      className="w-full max-w-4xl mx-auto p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {config.rows.map((row) => (
        <FormRow
          key={row.id}
          row={row}
          RowWrapper={RowWrapper}
        />
      ))}
      
      <FormActions
        onReset={handleReset}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
      />
    </form>
  );
});

EnhancedFormBuilder.displayName = 'EnhancedFormBuilder';

export default EnhancedFormBuilder;