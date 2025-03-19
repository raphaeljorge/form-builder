import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { ChipFieldProps } from "./types";
import type { FieldOption as FormFieldOption } from "../../../types/form";

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
  const normalizedOptions: NormalizedOption[] = field.options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option as NormalizedOption;
  });

  // Filter options based on input value and already selected chips
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions([]);
      return;
    }

    const filtered = normalizedOptions.filter(
      (option) => 
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

  return (
    <div className={`form-field ${isLoading ? "loading" : ""}`}>
      <div className="form-label-container">
        <span id={`${field.id}-label`} className="form-label">
          {field.label}
          {field.required && <span className="required-mark">*</span>}
          {field.minItems && (
            <span className="form-hint">
              (Select at least {field.minItems})
            </span>
          )}
          {field.maxItems && (
            <span className="form-hint">
              (Maximum {field.maxItems})
            </span>
          )}
        </span>
      </div>
      
      {isLoading ? (
        // Skeleton loading state
        <div className="form-skeleton">
          <div className="skeleton-input" />
          <div className="skeleton-chips">
            <div className="skeleton-chip" />
            <div className="skeleton-chip" />
          </div>
        </div>
      ) : (
        <>
          {/* Autocomplete input */}
          <div className="chip-autocomplete">
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              placeholder={field.placeholder || "Type to search..."}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={isLoading || (field.maxItems ? selectedChips.length >= field.maxItems : false)}
            />
            
            {/* Dropdown for autocomplete options */}
            {showDropdown && filteredOptions.length > 0 && (
              <div className="chip-dropdown">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip-option"
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
        </>
      )}
      
      {!isLoading && (
        /* Selected chips */
        <div className="chip-container">
          {selectedChips.map((chipValue) => {
            // Find the option for this chip
            const option = normalizedOptions.find((opt) => opt.value === chipValue);
            const chipLabel = option ? option.label : chipValue;
            
            return (
              <div key={chipValue} className="chip chip-selected">
                <span className="chip-label">{chipLabel}</span>
                <button
                  type="button"
                  className="chip-remove"
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
      
      {error && !isLoading && <div className="form-error">{error}</div>}
    </div>
  );
};

export default ChipField;