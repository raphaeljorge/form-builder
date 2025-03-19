import type React from "react";
import { useRef, useEffect } from "react";
import type { SelectFieldProps } from "../types";
import type { FieldOption } from "../../../../types/form";
import styles from "./SelectField.module.css";
import { classNames } from "../../../../utils/classNames";
import { FormFieldContainer } from "../../common";

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

  // Skeleton loading state for the field
  const loadingContent = (
    <div className={classNames(
      styles.formSkeleton,
      "w-full py-2"
    )}>
      <div className={classNames(
        styles.skeletonInput,
        "w-full h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded animate-pulse"
      )} />
    </div>
  );

  // Normal select content
  const fieldContent = (
    <select
      ref={selectRef}
      id={field.id}
      className={classNames(
        styles.formSelect,
        error && styles.formSelectError,
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        error && "border-red-500 focus:ring-red-500 focus:border-red-500"
      )}
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
  );

  return (
    <FormFieldContainer
      id={field.id}
      label={field.label}
      required={field.required}
      error={error}
      isLoading={isLoading}
      loadingContent={loadingContent}
      className={classNames(styles.formField, isLoading && styles.loading)}
    >
      {fieldContent}
    </FormFieldContainer>
  );
};

export default SelectField;