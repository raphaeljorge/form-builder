import type React from "react";
import { useRef, useEffect } from "react";
import type { SelectFieldProps } from "./types";
import type { FieldOption } from "../../../types/form";

/**
 * Select field component using uncontrolled input with ref
 */
const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  error,
  isLoading = false,
}) => {
  // Use ref for uncontrolled select
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Update select value when value prop changes
  useEffect(() => {
    if (selectRef.current && selectRef.current.value !== value) {
      selectRef.current.value = value || "";
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Normalize options to { value, label } format
  const normalizedOptions = field.options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <div className="form-field">
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}
          {field.required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <select
        ref={selectRef}
        id={field.id}
        className={`form-select ${error ? "form-select-error" : ""}`}
        defaultValue={value || ""}
        onChange={handleChange}
        disabled={isLoading}
      >
        <option value="">{field.placeholder || "Select an option"}</option>
        
        {normalizedOptions.map((option: FieldOption) => {
          if (typeof option === "string") {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          }
          
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default SelectField;