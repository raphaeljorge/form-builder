import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from '../../context/FormContext';
import type { FieldConfig, FormValues } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';

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
const FieldSkeleton = memo(
  ({
    label,
    fieldType = 'text',
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
              <div className="h-4 bg-gray-300 rounded w-1/3" />
              <div className="h-4 bg-gray-300 rounded w-4" />
            </div>
          );
        case 'array':
          return (
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded w-full" />
              <div className="h-10 bg-gray-200 rounded w-full opacity-60" />
            </div>
          );
        case 'chip':
          return (
            <div className="h-10 bg-gray-200 rounded w-full flex items-center px-3 gap-2">
              <div className="h-6 bg-gray-300 rounded-full w-20 flex-shrink-0" />
              <div className="h-6 bg-gray-300 rounded-full w-16 flex-shrink-0" />
            </div>
          );
        case 'text':
          return <div className="h-10 bg-gray-200 rounded w-full" />;
        default:
          return <div className="h-10 bg-gray-200 rounded w-full" />;
      }
    };

    return (
      <div className="animate-pulse">
        {label && <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />}
        {renderFieldSkeleton()}
      </div>
    );
  }
);

FieldSkeleton.displayName = 'FieldSkeleton';

export const FormField = memo<FormFieldProps>(({ field, fieldId }) => {
  // Get form context
  const { watch, setValue, formState, validateField, shouldDisplayField, transformField } =
    useFormContext();

  // Check if field should be displayed based on conditions
  const shouldDisplay = useMemo(() => shouldDisplayField(fieldId), [shouldDisplayField, fieldId]);

  // Memoize the value and error to prevent unnecessary re-renders
  const rawValue = useMemo(() => watch(fieldId), [watch, fieldId]);

  // Apply any output transformations
  const value = useMemo(
    () => transformField(fieldId, rawValue, 'output'),
    [transformField, fieldId, rawValue]
  );

  // For select fields, if there's a value, we should never show an error
  const error = useMemo(() => {
    // Check if this is a select field with a value
    const isSelectField = field.type === 'select';
    const hasValue = value !== undefined && value !== null && value !== '';

    // If it's a select field with a value, never show an error
    if (isSelectField && hasValue) {
      return undefined;
    }

    // Otherwise, show the error as normal
    return formState.errors[fieldId]?.message;
  }, [formState.errors, fieldId, field.type, value]);
  // Track loading state with a slight delay to prevent flashing
  const [showLoading, setShowLoading] = useState(false);
  const isLoading = useMemo(
    () => formState.isLoading || formState.isSubmitting,
    [formState.isLoading, formState.isSubmitting]
  );

  // Set all fields to loading when form is submitting
  const isFieldLoading = useMemo(
    () => isLoading || formState.loadingFields?.[fieldId] || formState.isSubmitting,
    [isLoading, formState.loadingFields, fieldId, formState.isSubmitting]
  );

  // Add a small delay before showing loading state to prevent flashing
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isFieldLoading) {
      // Shorter delay when submitting to show loading state faster
      const delay = formState.isSubmitting ? 50 : 100;

      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isFieldLoading]);

  const defaultValue = useMemo(
    () => (field.type === 'array' || field.type === 'chip' ? [] : ''),
    [field.type]
  );

  // No validation on mount as per user request
  // Validation will only happen on user interaction or form submission

  // Memoize the change handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (newValue: any) => {
      // Apply input transformation before setting value
      const transformedValue = transformField(fieldId, newValue, 'input');

      // Special handling for select fields
      if (field.type === 'select') {
        // For select fields, we want to clear any validation errors
        // when a value is selected
        setValue(fieldId, transformedValue, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: false, // Don't validate select fields on change
        });

        // Manually clear any errors for this field
        if (
          transformedValue !== undefined &&
          transformedValue !== null &&
          transformedValue !== ''
        ) {
          // This will force a re-render without validation
          setTimeout(() => {
            validateField(fieldId, transformedValue);
          }, 0);
        }
      } else {
        // For other field types, use normal validation
        setValue(fieldId, transformedValue, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    },
    [fieldId, setValue, field.type, validateField, transformField]
  );

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
      <div
        className={`transition-opacity duration-200 ${showLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
      >
        <FieldRenderer
          config={field}
          value={value ?? defaultValue}
          onChange={handleChange}
          error={error}
          disabled={isFieldLoading}
        />
      </div>

      {showLoading && (
        <div
          className={`transition-opacity duration-200 ${showLoading ? 'opacity-100' : 'opacity-0'}`}
        >
          <FieldSkeleton label={field.label} fieldType={field.type} />
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
