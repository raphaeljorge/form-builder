import type React from "react";
import { useState, useEffect } from "react";
import type { ChipFieldProps } from "./types";
import type { FieldOption } from "../../../types/form";

/**
 * Chip field component with local state
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
  
  // Update local state when value prop changes
  useEffect(() => {
    setSelectedChips(value || []);
  }, [value]);

  // Normalize options to { value, label } format
  const normalizedOptions = field.options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  });

  // Toggle chip selection
  const toggleChip = (chipValue: string) => {
    if (isLoading) return;

    const isSelected = selectedChips.includes(chipValue);
    let newSelectedChips: string[];
    
    if (isSelected) {
      // Remove chip if already selected
      newSelectedChips = selectedChips.filter((v) => v !== chipValue);
    } else {
      // Add chip if not selected and within max limit
      if (field.maxItems && selectedChips.length >= field.maxItems) {
        return;
      }
      newSelectedChips = [...selectedChips, chipValue];
    }
    
    // Update local state
    setSelectedChips(newSelectedChips);
    
    // Notify parent component
    onChange(newSelectedChips);
  };

  return (
    <div className="form-field">
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
      
      <div className="chip-container">
        {normalizedOptions.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const isSelected = selectedChips.includes(optionValue);
          
          return (
            <button
              key={optionValue}
              type="button"
              className={`chip ${isSelected ? "chip-selected" : ""} ${
                isLoading ? "chip-disabled" : ""
              }`}
              onClick={() => toggleChip(optionValue)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleChip(optionValue);
                }
              }}
              disabled={isLoading}
              aria-pressed={isSelected}
              aria-labelledby={`${field.id}-label`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default ChipField;