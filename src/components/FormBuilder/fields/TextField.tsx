import type React from "react";
import { useRef, useEffect } from "react";
import type { TextFieldProps } from "./types";

/**
 * Text field component using uncontrolled input with ref
 */
const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  error,
  isLoading = false,
}) => {
  // Use ref for uncontrolled input
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update input value when value prop changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value || "";
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="form-field">
      {field.label && (
        <label htmlFor={field.id} className="form-label">
          {field.label}
          {field.required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        id={field.id}
        type="text"
        className={`form-input ${error ? "form-input-error" : ""}`}
        defaultValue={value || ""}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={isLoading}
      />
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default TextField;