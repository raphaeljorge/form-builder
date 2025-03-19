import type React from "react";
import type { FormBuilderProps } from "../../types/form";
import "./FormBuilder.css";
import { useFormBuilder } from "../../hooks/useFormBuilder";

// Field components
import { TextField, SelectField, ChipField, ArrayField } from "./fields";

/**
 * FormBuilder component
 * Renders form fields based on configuration
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  isLoading = false,
  children,
  form: externalForm, // Rename to avoid confusion
}) => {
  // Initialize form if not provided externally
  const internalForm = useFormBuilder(config);
  
  // Use external form if provided, otherwise use internal form
  const form = externalForm || internalForm;

  return (
    <form className="form-builder">
      {/* Render rows */}
      {config.rows.map((row) => (
        <div key={row.id} className="form-row">
          {/* Render columns */}
          {row.columns.map((column) => (
            <div key={column.id} className="form-column">
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
            </div>
          ))}
        </div>
      ))}

      {/* Render children (action buttons, etc.) */}
      {children}
    </form>
  );
};

export default FormBuilder;