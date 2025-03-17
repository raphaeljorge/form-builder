import { memo, useMemo, useEffect, useCallback, useState } from 'react';
import type { FieldConfig, FormValues } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';
import { useFormContext } from '../../context/FormContext';

interface FormFieldProps {
  field: FieldConfig;
  fieldId: string;
}

/**
 * Skeleton loader component for form fields
 */
/**
 * Enhanced skeleton loader for form fields that matches the appearance of the actual field
 */
const FieldSkeleton = memo(({
  label,
  fieldType = 'text'
}: {
  label?: string;
  fieldType?: 'text' | 'select' | 'array' | 'chip';
}) => {
  // Render different skeletons based on field type
  const renderFieldSkeleton = () => {
    switch (fieldType) {
      case 'select':
        return (
          <div className="h-10 bg-gray-200 rounded w-full flex items-center justify-between px-3">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-4"></div>
          </div>
        );
      case 'array':
        return (
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full opacity-60"></div>
          </div>
        );
      case 'chip':
        return (
          <div className="h-10 bg-gray-200 rounded w-full flex items-center px-3 gap-2">
            <div className="h-6 bg-gray-300 rounded-full w-20 flex-shrink-0"></div>
            <div className="h-6 bg-gray-300 rounded-full w-16 flex-shrink-0"></div>
          </div>
        );
      case 'text':
      default:
        return <div className="h-10 bg-gray-200 rounded w-full"></div>;
    }
  };

  return (
    <div className="animate-pulse">
      {label && (
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      )}
      {renderFieldSkeleton()}
    </div>
  );
});

FieldSkeleton.displayName = 'FieldSkeleton';

export const FormField = memo<FormFieldProps>(({
  field,
  fieldId
}) => {
  // Get form context
  const {
    watch,
    setValue,
    formState,
    validateField,
    shouldDisplayField,
    transformField
  } = useFormContext();
  
  // Check if field should be displayed based on conditions
  const shouldDisplay = useMemo(() => shouldDisplayField(fieldId), [shouldDisplayField, fieldId]);
  
  // Memoize the value and error to prevent unnecessary re-renders
  const rawValue = useMemo(() => watch(fieldId), [watch, fieldId]);
  
  // Apply any output transformations
  const value = useMemo(() =>
    transformField(fieldId, rawValue, 'output'),
    [transformField, fieldId, rawValue]
  );
  const error = useMemo(() => formState.errors[fieldId]?.message, [formState.errors, fieldId]);
  // Track loading state with a slight delay to prevent flashing
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = useMemo(() => formState.isLoading || formState.isSubmitting, [formState.isLoading, formState.isSubmitting]);
  const isFieldLoading = useMemo(() =>
    isLoading || formState.loadingFields?.[fieldId],
    [isLoading, formState.loadingFields, fieldId]
  );
  
  // Add a small delay before showing loading state to prevent flashing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isFieldLoading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, 100); // Small delay to prevent flashing for quick operations
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isFieldLoading]);
  
  const defaultValue = useMemo(() =>
    field.type === 'array' || field.type === 'chip' ? [] : '',
    [field.type]
  );

  // No validation on mount as per user request
  // Validation will only happen on user interaction or form submission

  // Memoize the change handler to prevent unnecessary re-renders
  const handleChange = useCallback((newValue: any) => {
    // Apply input transformation before setting value
    const transformedValue = transformField(fieldId, newValue, 'input');
    setValue(fieldId, transformedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [fieldId, setValue]);

  // If field should not be displayed based on conditions, return null
  if (!shouldDisplay) {
    return null;
  }

  return (
    <div
      className="flex-1 min-w-[200px]"
      data-testid={`field-${fieldId}`}
      aria-busy={isFieldLoading}
    >
      <div className={`transition-opacity duration-200 ${showLoading ? 'opacity-0 absolute' : 'opacity-100'}`}>
        <FieldRenderer
          config={field}
          value={value ?? defaultValue}
          onChange={handleChange}
          error={error}
          disabled={isFieldLoading}
        />
      </div>
      
      {showLoading && (
        <div className={`transition-opacity duration-200 ${showLoading ? 'opacity-100' : 'opacity-0'}`}>
          <FieldSkeleton
            label={field.label}
            fieldType={field.type}
          />
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';