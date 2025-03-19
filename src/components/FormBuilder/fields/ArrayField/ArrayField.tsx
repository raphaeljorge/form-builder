import type React from "react";
import { useState, useEffect } from "react";
import type { ArrayFieldProps } from "../types";
import styles from "./ArrayField.module.css";
import { classNames } from "../../../../utils/classNames";
import { FormFieldContainer } from "../../common";
import TextField from "../TextField";

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
    
    // Use arrayOperations to add a new item
    // This will update the form state, which will trigger the useEffect
    // that updates the local state
    arrayOperations.add("");
  };

  // Remove an item from the array
  const removeItem = (index: number) => {
    if (isLoading) return;
    
    // Check if we're at the minimum number of items
    if (field.minItems && items.length <= field.minItems) {
      return;
    }
    
    // Use arrayOperations to remove an item
    // This will update the form state, which will trigger the useEffect
    // that updates the local state
    arrayOperations.remove(index);
  };

  // Update an item in the array
  const updateItem = (index: number, itemValue: string) => {
    if (isLoading) return;
    
    if (arrayOperations.update) {
      // Use arrayOperations.update if available
      arrayOperations.update(index, itemValue);
    } else {
      // Fall back to direct update if update method is not available
      const newItems = [...items];
      newItems[index] = itemValue;
      
      // Update local state and notify parent
      setItems(newItems);
      onChange(newItems);
    }
  };

  // Custom header with label and add button
  const customHeader = (
    <div className={classNames(
      styles.arrayFieldHeader,
      "flex justify-between items-center mb-4"
    )}>
      <button
        type="button"
        className={classNames(
          styles.arrayAddButton,
          "px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600",
          (isLoading || (field.maxItems ? items.length >= field.maxItems : false)) ? "bg-blue-300 cursor-not-allowed" : ""
        )}
        onClick={addItem}
        disabled={isLoading || (field.maxItems ? items.length >= field.maxItems : false)}
        aria-label="Add item"
      >
        Add
      </button>
    </div>
  );

  // Skeleton loading state for the field
  const loadingContent = (
    <div className={classNames(
      styles.formSkeleton,
      "w-full py-2"
    )}>
      <div className={classNames(
        styles.skeletonArrayItems,
        "flex flex-col gap-4 mt-4"
      )}>
        <div className={classNames(
          styles.skeletonArrayItem,
          "flex gap-4 items-center p-4 bg-white border border-gray-200 rounded-md"
        )}>
          <div className={classNames(
            styles.skeletonInput,
            "w-full h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded animate-pulse"
          )} />
          <div className={classNames(
            styles.skeletonButton,
            "w-[80px] h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded animate-pulse flex-shrink-0"
          )} />
        </div>
        {items.length > 1 && (
          <div className={classNames(
            styles.skeletonArrayItem,
            "flex gap-4 items-center p-4 bg-white border border-gray-200 rounded-md"
          )}>
            <div className={classNames(
              styles.skeletonInput,
              "w-full h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded animate-pulse"
            )} />
            <div className={classNames(
              styles.skeletonButton,
              "w-[80px] h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded animate-pulse flex-shrink-0"
            )} />
          </div>
        )}
      </div>
    </div>
  );

  // Normal field content
  const fieldContent = (
    <>
      {customHeader}
      
      {items.length === 0 && !isLoading && (
        <div className={classNames(
          styles.arrayEmptyMessage,
          "text-center p-4 text-gray-500 italic bg-white border border-dashed border-gray-300 rounded-md"
        )}>
          No items added yet. Click "Add" to add an item.
        </div>
      )}
      
      {items.length > 0 && !isLoading && (
        <div className={classNames(
          styles.arrayItems,
          "flex flex-col gap-4"
        )}>
          {items.map((item, index) => (
            <div key={`${field.id}-item-${index}`} className={classNames(
              styles.arrayItem,
              "flex gap-4 items-start p-4 bg-white border border-gray-200 rounded-md"
            )}>
              <div className={classNames(
                styles.arrayItemContent,
                "flex-1"
              )}>
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
                className={classNames(
                  styles.arrayRemoveButton,
                  "px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium mt-6 hover:bg-red-600",
                  (isLoading || (field.minItems ? items.length <= field.minItems : false)) ? "bg-red-300 cursor-not-allowed" : ""
                )}
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
    </>
  );

  return (
    <FormFieldContainer
      id={field.id}
      label={field.label}
      required={field.required}
      hint={field.minItems ? `Minimum ${field.minItems}` : undefined}
      error={error}
      isLoading={isLoading}
      loadingContent={loadingContent}
      className={classNames(
        styles.formField,
        styles.arrayField,
        isLoading && styles.loading,
        "border border-gray-200 rounded-md p-4 bg-gray-50"
      )}
    >
      {fieldContent}
    </FormFieldContainer>
  );
};

export default ArrayField;