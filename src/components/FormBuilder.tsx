import React, { memo, useCallback } from 'react';
import type { FormBuilderProps, FormConfig, FieldValue, RowWrapperProps } from '../types/form';
import { FormField } from './FormField';

const DefaultRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-4 mb-4 ${className}`}>{children}</div>
));

DefaultRowWrapper.displayName = 'DefaultRowWrapper';

const FormColumn = memo<{
  fieldConfig: any;
  value: FieldValue;
  onFieldChange: (id: string, value: FieldValue) => void;
}>(({ fieldConfig, value, onFieldChange }) => (
  <div className="flex-1 min-w-[200px]">
    <FormField
      config={fieldConfig}
      value={value}
      onChange={(value) => onFieldChange(fieldConfig.id, value)}
    />
  </div>
));

FormColumn.displayName = 'FormColumn';

const FormRow = memo<{
  row: any;
  state: Record<string, FieldValue>;
  onFieldChange: (id: string, value: FieldValue) => void;
  DefaultWrapper: React.ComponentType<RowWrapperProps>;
}>(({ row, state, onFieldChange, DefaultWrapper }) => {
  const WrapperComponent = row.RowWrapper || DefaultWrapper;
  
  return (
    <WrapperComponent {...row.wrapperProps}>
      {row.columns.map((fieldConfig: any) => (
        <FormColumn
          key={fieldConfig.id}
          fieldConfig={fieldConfig}
          value={state[fieldConfig.id]}
          onFieldChange={onFieldChange}
        />
      ))}
    </WrapperComponent>
  );
});

FormRow.displayName = 'FormRow';

const FormBuilder = memo(<T extends FormConfig>({
  config,
  state,
  onChange,
  RowWrapper = DefaultRowWrapper,
}: FormBuilderProps<T>) => {
  const handleFieldChange = useCallback((id: string, value: FieldValue) => {
    onChange(id as keyof typeof state, value);
  }, [onChange]);

  return (
    <form className="w-full max-w-4xl mx-auto p-6">
      {config.rows.map((row) => (
        <FormRow
          key={row.id}
          row={row}
          state={state}
          onFieldChange={handleFieldChange}
          DefaultWrapper={RowWrapper}
        />
      ))}
    </form>
  );
});

FormBuilder.displayName = 'FormBuilder';

export default FormBuilder;