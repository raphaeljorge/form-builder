import type React from "react";
import type { FormBuilderProps, WrapperProps } from "../../types/form";
import styles from "./FormBuilder.module.css";
import { classNames } from "../../utils/classNames";
import { useFormBuilder } from "../../hooks/useFormBuilder";

// Field components
import { TextField, SelectField, ChipField, ArrayField } from "./fields";

/**
 * FormBuilder component
 * Renders form fields based on configuration
 */
// Default wrapper components
const DefaultRowWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div key={id} className={classNames(styles.formRow, "flex flex-wrap mb-6 gap-4 w-full")}>
    {children}
  </div>
);

const DefaultColumnWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div key={id} className={classNames(styles.formColumn, "flex-1 min-w-[250px] w-full")}>
    {children}
  </div>
);

export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  isLoading = false,
  form: externalForm, // Rename to avoid confusion
  RowWrapper = DefaultRowWrapper,
  ColumnWrapper = DefaultColumnWrapper,
}) => {
  // Initialize form if not provided externally
  const internalForm = useFormBuilder(config);
  
  // Use external form if provided, otherwise use internal form
  const form = externalForm || internalForm;

  // Get the appropriate wrapper component for a row
  const getRowWrapper = (row: any) => {
    // If row has a wrapper property, use it directly
    if (row.wrapper) {
      return row.wrapper;
    }
    // Otherwise use the default RowWrapper
    return RowWrapper;
  };

  // Get the appropriate wrapper component for a column
  const getColumnWrapper = (column: any) => {
    // If column has a wrapper property, use it directly
    if (column.wrapper) {
      return column.wrapper;
    }
    // Otherwise use the default ColumnWrapper
    return ColumnWrapper;
  };

  return (
    <form className={classNames(styles.formBuilder, "w-full max-w-full font-sans")}>
      {/* Render rows */}
      {config.rows.map((row) => {
        const CurrentRowWrapper = getRowWrapper(row);
        return (
          <CurrentRowWrapper key={row.id} id={row.id} {...row.wrapperProps}>
            {/* Render columns */}
            {row.columns.map((column) => {
              const CurrentColumnWrapper = getColumnWrapper(column);
              return (
                <CurrentColumnWrapper key={column.id} id={column.id} {...column.wrapperProps}>
              {/* Render field based on type */}
              {column.type === "text" && (
                <TextField
                  field={column}
                  value={form.getValue(column.id) || ""}
                  onChange={(value: string) => {
                    form.setValue(column.id, value);
                  }}
                  error={form.formState.errors[column.id]?.message}
                  isLoading={isLoading}
                />
              )}

              {column.type === "select" && (
                <SelectField
                  field={column}
                  value={form.getValue(column.id) || ""}
                  onChange={(value: string) => {
                    form.setValue(column.id, value);
                  }}
                  error={form.formState.errors[column.id]?.message}
                  isLoading={isLoading}
                />
              )}

              {column.type === "chip" && (
                <ChipField
                  field={column}
                  value={form.getValue(column.id) || []}
                  onChange={(value: string[]) => {
                    form.setValue(column.id, value);
                  }}
                  error={form.formState.errors[column.id]?.message}
                  isLoading={isLoading}
                />
              )}

              {column.type === "array" && (
                <ArrayField
                  field={column}
                  value={form.getValue(column.id) || []}
                  onChange={(value: any[]) => {
                    form.setValue(column.id, value);
                  }}
                  error={form.formState.errors[column.id]?.message}
                  arrayOperations={form.arrayFields[column.id]}
                  isLoading={isLoading}
                />
              )}
                </CurrentColumnWrapper>
              );
            })}
          </CurrentRowWrapper>
        );
      })}
    </form>
  );
};

export default FormBuilder;