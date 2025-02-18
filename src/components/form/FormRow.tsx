import React, { memo, useMemo } from 'react';
import type { FormConfig, RowWrapperProps } from '../../types/form';
import { FormField } from './FormField';

interface FormRowProps {
  row: FormConfig['rows'][number];
  RowWrapper: React.ComponentType<RowWrapperProps>;
}

export const FormRow = memo<FormRowProps>(({ row, RowWrapper }) => {
  const WrapperComponent = useMemo(
    () => row.RowWrapper || RowWrapper,
    [row.RowWrapper, RowWrapper]
  );

  return (
    <WrapperComponent
      key={row.id}
      {...row.wrapperProps}
    >
      {row.columns.map((fieldConfig) => (
        <FormField
          key={fieldConfig.id}
          field={fieldConfig}
          fieldId={fieldConfig.id}
        />
      ))}
    </WrapperComponent>
  );
});

FormRow.displayName = 'FormRow';