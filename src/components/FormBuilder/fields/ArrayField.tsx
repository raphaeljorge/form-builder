import type React from "react";
import { useState, useEffect } from "react";
import type { ArrayFieldProps } from "./types";
import TextField from "./TextField";

/**
 * Array field component with local state
 */
const ArrayField: React.FC<ArrayFieldProps> = ({
  field,
  value = [],
  onChange,
  error,
  arrayOperations,
  isLoading = false,
}) => {
  // Use local state to track array items
  const [items, setItems] = useState<any[]>(value || []);
  
  // Update local state when value prop changes
  useEffect(() => {
    setItems(value || []);
  }, [value]);

  // Add a new item to the array
  const addItem = () => {
    if (isLoading) return;
    
    // Check if we've reached the maximum number of items
    if (field.maxItems && items.length >= field.maxItems) {
      return;
    }
    
    // Add a new empty item
    const newItems = [...items, ""];
    setItems(newItems);
    onChange(newItems);
    arrayOperations.add("");
  };

  // Remove an item from the array
  const removeItem = (index: number) => {
    if (isLoading) return;
    
    // Check if we're at the minimum number of items
    if (field.minItems && items.length <= field.minItems) {
      return;
    }
    
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
    arrayOperations.remove(index);
  };

  // Update an item in the array
  const updateItem = (index: number, itemValue: string) => {
    if (isLoading) return;
    
    const newItems = [...items];
    newItems[index] = itemValue;
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="form-field array-field">
      <div className="array-field-header">
        <div className="form-label-container">
          <span id={`${field.id}-label`} className="form-label">
            {field.label}
            {field.required && <span className="required-mark">*</span>}
          </span>
          {field.minItems && (
            <span className="form-hint">
              (Minimum {field.minItems})
            </span>
          )}
          {field.maxItems && (
            <span className="form-hint">
              (Maximum {field.maxItems})
            </span>
          )}
        </div>
        
        <button
          type="button"
          className="array-add-button"
          onClick={addItem}
          disabled={isLoading || (field.maxItems ? items.length >= field.maxItems : false)}
          aria-label="Add item"
        >
          Add
        </button>
      </div>
      
      {items.length === 0 && (
        <div className="array-empty-message">
          No items added yet. Click "Add" to add an item.
        </div>
      )}
      
      {items.length > 0 && (
        <div className="array-items">
          {items.map((item, index) => (
            <div key={`${field.id}-item-${index}`} className="array-item">
              <div className="array-item-content">
                {field.template.type === "text" && (
                  <TextField
                    field={{
                      ...field.template,
                      id: `${field.id}-${index}`,
                      label: `Item ${index + 1}`,
                      type: "text",
                    } as any}
                    value={item}
                    onChange={(value) => updateItem(index, value)}
                    isLoading={isLoading}
                  />
                )}
                {/* Add support for other field types as needed */}
              </div>
              
              <button
                type="button"
                className="array-remove-button"
                onClick={() => removeItem(index)}
                disabled={isLoading || (field.minItems ? items.length <= field.minItems : false)}
                aria-label={`Remove item ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default ArrayField;