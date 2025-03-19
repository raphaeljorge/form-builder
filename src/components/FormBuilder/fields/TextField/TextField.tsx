import type React from "react";
import { useRef, useEffect, useState } from "react";
import type { TextFieldProps } from "../types";
import styles from "./TextField.module.css";
import { classNames } from "../../../../utils/classNames";
import { FormFieldContainer } from "../../common";

/**
 * Count the number of value placeholders in a mask
 */
const countValuePlaceholders = (mask: string): number => {
  return (mask.match(/[#A*]/g) || []).length;
};

/**
 * Apply mask to a string value
 * @export
 */
export const applyMask = (value: string, mask: string): string => {
  if (!mask || !value) return value;
  
  // First, remove any non-alphanumeric characters from the value
  // This ensures we're only working with the raw input
  const rawValue = value.replace(/[^a-zA-Z0-9]/g, '');
  
  let result = '';
  let rawIndex = 0;
  
  // Apply the mask as long as we have characters in the raw value
  for (let i = 0; i < mask.length && rawIndex < rawValue.length; i++) {
    const maskChar = mask[i];
    
    if (maskChar === '#') {
      // # represents a digit
      if (rawIndex < rawValue.length) {
        if (/\d/.test(rawValue[rawIndex])) {
          result += rawValue[rawIndex];
        }
        rawIndex++;
      }
    } else if (maskChar === 'A') {
      // A represents a letter
      if (rawIndex < rawValue.length) {
        if (/[a-zA-Z]/.test(rawValue[rawIndex])) {
          result += rawValue[rawIndex];
        }
        rawIndex++;
      }
    } else if (maskChar === '*') {
      // * represents any character
      if (rawIndex < rawValue.length) {
        result += rawValue[rawIndex];
        rawIndex++;
      }
    } else {
      // For special characters in the mask, add them to the result
      result += maskChar;
    }
  }
  
  return result;
};

/**
 * Extract raw value from a masked value
 */
const extractRawValue = (value: string): string => {
  // Remove any non-alphanumeric characters
  return value.replace(/[^a-zA-Z0-9]/g, '');
};


const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  error,
  isLoading = false,
}) => {
  // State for the displayed value (with mask)
  const [displayValue, setDisplayValue] = useState<string>(
    field.mask ? applyMask(value || '', field.mask) : (value || '')
  );
  // Use ref for uncontrolled input
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update input value when value prop changes
  useEffect(() => {
    const newDisplayValue = field.mask ? applyMask(value || '', field.mask) : (value || '');
    setDisplayValue(newDisplayValue);
    
    if (inputRef.current && inputRef.current.value !== newDisplayValue) {
      inputRef.current.value = newDisplayValue;
    }
  }, [value, field.mask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (field.mask) {
      // Extract the raw value (digits/letters only)
      let rawValue = extractRawValue(inputValue);
      
      // Limit the raw value to the number of placeholders in the mask
      const maxLength = countValuePlaceholders(field.mask);
      if (rawValue.length > maxLength) {
        rawValue = rawValue.substring(0, maxLength);
      }
      
      // Apply the mask to get the formatted value
      const maskedValue = applyMask(rawValue, field.mask);
      
      // Update the displayed value with the mask
      setDisplayValue(maskedValue);
      
      // Send the raw value to the parent
      onChange(rawValue);
    } else {
      // No mask, just update the value
      setDisplayValue(inputValue);
      onChange(inputValue);
    }
  };

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

  // Normal input content
  const fieldContent = (
    <input
      ref={inputRef}
      id={field.id}
      type="text"
      className={classNames(
        styles.formInput,
        error && styles.formInputError,
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        error && "border-red-500 focus:ring-red-500 focus:border-red-500"
      )}
      value={displayValue}
      onChange={handleChange}
      placeholder={field.placeholder}
      disabled={isLoading}
    />
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

export default TextField;