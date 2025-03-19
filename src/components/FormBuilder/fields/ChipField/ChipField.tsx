import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import type { ChipFieldProps } from "../types";
import type { FieldOption as FormFieldOption } from "../../../../types/form";
import styles from "./ChipField.module.css";
import { classNames } from "../../../../utils/classNames";
import { FormFieldContainer } from "../../common";

// Define a normalized option type to ensure it always has value and label
interface NormalizedOption {
  value: string;
  label: string;
}

/**
 * Chip field component with autocomplete
 */
const ChipField: React.FC<ChipFieldProps> = ({
  field,
  value = [],
  onChange,
  error,
  isLoading = false,
}) => {
  // Use local state to track selected chips
  const [selectedChips, setSelectedChips] = useState<string[]>(value || []);
  // State for the autocomplete input
  const [inputValue, setInputValue] = useState<string>("");
  // State for showing/hiding the dropdown
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  // State for filtered options
  const [filteredOptions, setFilteredOptions] = useState<NormalizedOption[]>([]);
  // Ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local state when value prop changes
  useEffect(() => {
    setSelectedChips(value || []);
  }, [value]);

  // Normalize options to { value, label } format
  const normalizedOptions = useMemo(() => {
    return field.options.map((option) => {
      if (typeof option === "string") {
        return { value: option, label: option };
      }
      return option as NormalizedOption;
    });
  }, [field.options]);

  // Filter options based on input value and already selected chips
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions([]);
      return;
    }

    const filtered = normalizedOptions.filter(
      (option: NormalizedOption) =>
        // Filter by input value (case insensitive)
        option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        // Filter out already selected options
        !selectedChips.includes(option.value)
    );
    
    setFilteredOptions(filtered);
  }, [inputValue, normalizedOptions, selectedChips]);

  // Add a chip
  const addChip = (chipValue: string) => {
    if (isLoading) return;

    // Check if already selected
    if (selectedChips.includes(chipValue)) return;
    
    // Check if we've reached the maximum number of items
    if (field.maxItems && selectedChips.length >= field.maxItems) {
      return;
    }

    // Add the chip
    const newSelectedChips = [...selectedChips, chipValue];
    
    // Update local state
    setSelectedChips(newSelectedChips);
    
    // Clear input
    setInputValue("");
    
    // Hide dropdown
    setShowDropdown(false);
    
    // Notify parent component
    onChange(newSelectedChips);
  };

  // Remove a chip
  const removeChip = (chipValue: string) => {
    if (isLoading) return;

    // Remove the chip
    const newSelectedChips = selectedChips.filter((v) => v !== chipValue);
    
    // Update local state
    setSelectedChips(newSelectedChips);
    
    // Notify parent component
    onChange(newSelectedChips);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (inputValue.trim() !== "") {
      setShowDropdown(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding the dropdown to allow for option selection
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  // Handle option selection
  const handleOptionSelect = (option: NormalizedOption) => {
    addChip(option.value);
    
    // Focus the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
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
      <div className={classNames(
        styles.skeletonChips,
        "flex flex-wrap gap-2 mt-2"
      )}>
        <div className={classNames(
          styles.skeletonChip,
          "w-[100px] h-[32px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded-full animate-pulse"
        )} />
        <div className={classNames(
          styles.skeletonChip,
          "w-[100px] h-[32px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded-full animate-pulse"
        )} />
      </div>
    </div>
  );

  // Normal field content
  const fieldContent = (
    <>
      {/* Autocomplete input */}
      <div className={classNames(
        styles.chipAutocomplete,
        "relative w-full"
      )}>
        <input
          ref={inputRef}
          type="text"
          className={classNames(
            styles.formInput,
            "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          )}
          placeholder={field.placeholder || "Type to search..."}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isLoading || (field.maxItems ? selectedChips.length >= field.maxItems : false)}
        />
        
        {/* Dropdown for autocomplete options */}
        {showDropdown && filteredOptions.length > 0 && (
          <div className={classNames(
            styles.chipDropdown,
            "absolute top-full left-0 w-full max-h-[200px] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1"
          )}>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={classNames(
                  styles.chipOption,
                  "p-2 cursor-pointer transition-colors duration-200 text-left w-full border-none bg-transparent hover:bg-gray-100"
                )}
                onClick={() => handleOptionSelect(option)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOptionSelect(option);
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {!isLoading && (
        <div className={classNames(
          styles.chipContainer,
          "flex flex-wrap gap-2 mt-2"
        )}>
          {selectedChips.map((chipValue) => {
            // Find the option for this chip
            const option = normalizedOptions.find((opt: NormalizedOption) => opt.value === chipValue);
            const chipLabel = option ? option.label : chipValue;
            
            return (
              <div key={chipValue} className={classNames(
                styles.chip,
                styles.chipSelected,
                "inline-flex items-center px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-full text-sm gap-2"
              )}>
                <span className={classNames(
                  styles.chipLabel,
                  "mr-1"
                )}>{chipLabel}</span>
                <button
                  type="button"
                  className={classNames(
                    styles.chipRemove,
                    "bg-transparent border-none text-inherit text-xl leading-none p-0 cursor-pointer opacity-70 hover:opacity-100"
                  )}
                  onClick={() => removeChip(chipValue)}
                  aria-label={`Remove ${chipLabel}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <FormFieldContainer
      id={field.id}
      label={field.label}
      required={field.required}
      hint={field.minItems ? `Select at least ${field.minItems}` : undefined}
      error={error}
      isLoading={isLoading}
      loadingContent={loadingContent}
      className={classNames(styles.formField, isLoading && styles.loading)}
    >
      {fieldContent}
    </FormFieldContainer>
  );
};

export default ChipField;