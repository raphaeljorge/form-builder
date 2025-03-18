import type React from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useFormContext } from '../context/FormContext';
import type { FormConfig, FormValues, RowWrapperProps } from '../types/form';
import { DefaultRowWrapper } from './form/DefaultRowWrapper';
import { FormActions } from './form/FormActions';
import { FormRow } from './form/FormRow';

interface EnhancedFormBuilderProps<T extends FormConfig> {
  config: T;
  onSubmit: (data: FormValues) => void;
  RowWrapper?: React.ComponentType<RowWrapperProps>;
  defaultValues?: Partial<FormValues>;
}

export const EnhancedFormBuilder = memo(
  <T extends FormConfig>({
    config,
    onSubmit,
    RowWrapper = DefaultRowWrapper,
  }: EnhancedFormBuilderProps<T>) => {
    const {
      handleSubmit,
      formState: { isSubmitting, isDirty },
      resetForm,
    } = useFormContext();

    const handleReset = useCallback(() => {
      resetForm();
    }, [resetForm]);

    const handleFormSubmit = useCallback(
      (data: FormValues) => {
        onSubmit(data);
      },
      [onSubmit]
    );

    const rows = useMemo(
      () => config.rows.map((row) => <FormRow key={row.id} row={row} RowWrapper={RowWrapper} />),
      [config.rows, RowWrapper]
    );

    const actions = useMemo(
      () => <FormActions onReset={handleReset} isSubmitting={isSubmitting} isDirty={isDirty} />,
      [handleReset, isSubmitting, isDirty]
    );

    return (
      <form className="w-full max-w-4xl mx-auto p-6" onSubmit={handleSubmit(handleFormSubmit)}>
        {rows}
        {actions}
      </form>
    );
  }
);

EnhancedFormBuilder.displayName = 'EnhancedFormBuilder';

export default EnhancedFormBuilder;
