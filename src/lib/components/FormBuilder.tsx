import React, { memo } from 'react';
import type { FormBuilderProps, FormConfig } from '../types/form';
import { FormField } from './FormField';

const DefaultRowWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap gap-4 mb-4">{children}</div>
);

export const FormBuilder = memo(<T extends FormConfig>({
  config,
  state,
  onChange,
  RowWrapper = DefaultRowWrapper,
}: FormBuilderProps<T>) => {
  return (
    <form className="w-full max-w-4xl mx-auto p-6">
      {config.rows.map((row) => (
        <RowWrapper key={row.id} {...row.wrapperProps}>
          {row.columns.map((fieldConfig) => (
            <div key={fieldConfig.id} className="flex-1 min-w-[200px]">
              <FormField
                config={fieldConfig}
                value={state[fieldConfig.id]}
                onChange={(value) => onChange(fieldConfig.id, value)}
              />
            </div>
          ))}
        </RowWrapper>
      ))}
    </form>
  );
});