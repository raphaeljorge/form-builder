import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import type React from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { EnhancedFormBuilder } from './components/EnhancedFormBuilder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { formConfig } from './config/formConfig';
import { FormProvider, useFormContext } from './context/FormContext';
import {
  type FieldCondition,
  type FieldTransformation,
  useFormBuilder,
} from './hooks/useFormBuilder';
import { submitFormData } from './services/api';
import type { FormValues, RowWrapperProps } from './types/form';

const queryClient = new QueryClient();

const PrimaryRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`bg-gray-50 p-4 rounded-lg shadow-sm ${className}`}>
    <div className="flex flex-wrap gap-4">{children}</div>
  </div>
));

const SecondaryRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
    <div className="flex flex-wrap gap-4">{children}</div>
  </div>
));

// Update the config to use the local wrapper components
const config = {
  ...formConfig,
  rows: formConfig.rows.map((row, index) => ({
    ...row,
    RowWrapper: index === 0 ? PrimaryRowWrapper : SecondaryRowWrapper,
  })),
};

// Initialize default values based on config
const getDefaultValues = () => {
  const defaultValues: Partial<FormValues> = {
    phone: '',
    ssn: '',
    country: '',
    state: '',
    password: '',
    confirmPassword: '',
    skills: [],
    emails: [''],
    addresses: [''],
    // New fields for demonstrating features
    showAdvanced: false,
    advancedField: '',
    formattedNumber: '1000',
    dynamicArrayField: ['Item 1'],
  };

  return defaultValues;
};

// Example field transformations
const numberTransformation: FieldTransformation = {
  // Format number with commas for display
  output: (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  },
  // Remove commas for storage
  input: (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  },
};

// Example field condition
const advancedFieldCondition: FieldCondition = {
  dependsOn: ['showAdvanced'],
  shouldDisplay: (values) => values.showAdvanced === true,
};

const ArrayFieldControls = () => {
  const { setValue, getValues } = useFormContext();

  const handleAddEmail = () => {
    const currentEmails = (getValues('emails') || []) as string[];
    setValue('emails', [...currentEmails, ''], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleAddAddress = () => {
    const currentAddresses = (getValues('addresses') || []) as string[];
    setValue('addresses', [...currentAddresses, ''], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleRemoveEmail = (index: number) => {
    const currentEmails = (getValues('emails') || []) as string[];
    setValue(
      'emails',
      currentEmails.filter((_: string, i: number) => i !== index),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };

  const handleRemoveAddress = (index: number) => {
    const currentAddresses = (getValues('addresses') || []) as string[];
    setValue(
      'addresses',
      currentAddresses.filter((_: string, i: number) => i !== index),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Array Field Controls</h2>

      {/* Email Array Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Email Addresses:</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddEmail}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Add Email
          </button>
          <button
            type="button"
            onClick={() => handleRemoveEmail(0)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Remove First
          </button>
        </div>
      </div>

      {/* Address Array Controls */}
      <div>
        <h3 className="text-lg font-medium mb-2">Addresses:</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddAddress}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Add Address
          </button>
          <button
            type="button"
            onClick={() => handleRemoveAddress(0)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Remove First
          </button>
        </div>
      </div>
    </div>
  );
};

const FormControls = () => {
  const { resetForm, setFieldFocus, validateField, setLoading, setFieldLoading } = useFormContext();

  // Reset options examples
  const resetOptions = {
    'Complete Reset': undefined,
    'Keep Errors': { keepErrors: true },
    'Keep Values': { keepValues: true },
    'Keep Touched': { keepTouched: true },
    'Keep All': {
      keepErrors: true,
      keepValues: true,
      keepTouched: true,
      keepDirty: true,
    },
  };

  // Loading state controls
  const handleSetLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSetFieldLoading = (field: string) => {
    setFieldLoading(field, true);
    setTimeout(() => {
      setFieldLoading(field, false);
    }, 2000);
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Form Controls</h2>

      <div className="space-y-6">
        {/* Field Focus Controls */}
        <div>
          <h3 className="text-lg font-medium mb-2">Focus Management:</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFieldFocus('phone')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Focus Phone
            </button>
            <button
              type="button"
              onClick={() => setFieldFocus('ssn')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Focus SSN
            </button>
            <button
              type="button"
              onClick={() => setFieldFocus('country')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Focus Country
            </button>
          </div>
        </div>

        {/* Field Validation Controls */}
        <div>
          <h3 className="text-lg font-medium mb-2">Field Validation:</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => validateField('phone')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Validate Phone
            </button>
            <button
              type="button"
              onClick={() => validateField('ssn')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Validate SSN
            </button>
            <button
              type="button"
              onClick={() => validateField('country')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Validate Country
            </button>
          </div>
        </div>

        {/* Loading State Controls */}
        <div>
          <h3 className="text-lg font-medium mb-2">Loading State:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSetLoading}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Set All Fields Loading (2s)
            </button>
            <button
              type="button"
              onClick={() => handleSetFieldLoading('phone')}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Set Phone Loading (2s)
            </button>
            <button
              type="button"
              onClick={() => handleSetFieldLoading('country')}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Set Country Loading (2s)
            </button>
          </div>
        </div>

        {/* Reset Controls */}
        <div>
          <h3 className="text-lg font-medium mb-2">Reset Options:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(resetOptions).map(([label, options]) => (
              <button
                key={label}
                type="button"
                onClick={() => resetForm(options)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Reset ({label})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FormStateDisplay = () => {
  const { state, formState } = useFormContext();
  const { raw, masked } = state;

  // Track form state
  const {
    isDirty = false,
    isValid = false,
    isSubmitting = false,
    isSubmitSuccessful = false,
    isSubmitted = false,
    isValidating = false,
    isLoading = false,
    submitCount = 0,
    errors = {},
    dirtyFields = {},
    loadingFields = {},
  } = formState;

  return (
    <div className="mt-8 space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Form Values:</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Quick Access Values:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <p>
                <strong>Phone:</strong>
              </p>
              <p>Raw: {raw.phone}</p>
              <p>Masked: {Array.isArray(masked.phone) ? masked.phone.join(', ') : masked.phone}</p>
              <p className="mt-2 text-sm text-gray-600">
                Changed: {dirtyFields.phone ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <p>
                <strong>Country:</strong> {raw.country}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Changed: {dirtyFields.country ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Masked Values:</h3>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(masked, null, 2)}</pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Raw Values:</h3>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(raw, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Form State:</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Status:</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Has Changes (Is Dirty):</span>
                <span className={`ml-2 ${isDirty ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isDirty ? 'Yes - Form has unsaved changes' : 'No - Form is unchanged'}
                </span>
              </p>
              <p>
                <span className="font-medium">Is Valid:</span>
                <span className={`ml-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? 'Yes - All fields are valid' : 'No - Form has validation errors'}
                </span>
              </p>
              <p>
                <span className="font-medium">Is Submitting:</span>
                <span className={`ml-2 ${isSubmitting ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isSubmitting ? 'Yes - Form is being submitted' : 'No - Form is not submitting'}
                </span>
              </p>
              <p>
                <span className="font-medium">Is Loading:</span>
                <span className={`ml-2 ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isLoading ? 'Yes - Form is loading' : 'No - Form is not loading'}
                </span>
              </p>
              <p>
                <span className="font-medium">Is Submitted:</span>
                <span className={`ml-2 ${isSubmitted ? 'text-green-600' : 'text-gray-600'}`}>
                  {isSubmitted ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                <span className="font-medium">Submit Success:</span>
                <span className={`ml-2 ${isSubmitSuccessful ? 'text-green-600' : 'text-gray-600'}`}>
                  {isSubmitSuccessful ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                <span className="font-medium">Is Validating:</span>
                <span className={`ml-2 ${isValidating ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isValidating ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                <span className="font-medium">Submit Count:</span>
                <span className="ml-2">{submitCount}</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Changed Fields:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(Object.keys(dirtyFields), null, 2)}
            </pre>
          </div>
        </div>

        {/* Display loading state */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Loading State:</h3>
          <div className={`p-4 rounded ${isLoading ? 'bg-purple-50' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-3">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${isLoading ? 'bg-purple-500' : 'bg-gray-300'}`}
              />
              <p className={isLoading ? 'text-purple-800 font-medium' : 'text-gray-500'}>
                Form Loading State: {isLoading ? 'Active' : 'Inactive'}
              </p>
            </div>

            {Object.keys(loadingFields).length > 0 ? (
              <>
                <p className="mb-2 text-purple-800 font-medium">Fields currently loading:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(loadingFields).map(
                    ([fieldId, isFieldLoading]) =>
                      isFieldLoading && (
                        <div key={fieldId} className="flex items-center">
                          <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                            {fieldId}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No fields are currently loading</p>
            )}
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Errors:</h3>
            <pre className="bg-red-50 text-red-900 p-4 rounded">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

interface FormWithQueryProps {
  externalLoading?: boolean;
  loadingFields?: Record<string, boolean>;
}

const FormWithQuery: React.FC<FormWithQueryProps> = ({
  externalLoading = false,
  loadingFields = {},
}) => {
  // Memoize default values
  const defaultValues = useMemo(() => getDefaultValues(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form instance
  // Create a modified config with new fields to demonstrate features
  const enhancedConfig = {
    ...config,
    rows: [
      ...config.rows,
      // Add a toggle for conditional fields
      {
        id: 'conditionalRow',
        RowWrapper: SecondaryRowWrapper,
        columns: [
          {
            id: 'showAdvanced',
            type: 'select' as const,
            label: 'Show Advanced Options',
            options: [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ],
            transform: {
              // Transform string 'true'/'false' to boolean
              input: (value: string) => value === 'true',
              output: (value: boolean) => (value === true ? 'true' : 'false'),
            },
          },
        ],
      },
      // Conditional field that only shows when showAdvanced is true
      {
        id: 'advancedRow',
        RowWrapper: SecondaryRowWrapper,
        columns: [
          {
            id: 'advancedField',
            type: 'text' as const,
            label: 'Advanced Setting',
            placeholder: 'Only visible when advanced options are enabled',
            condition: advancedFieldCondition,
          },
        ],
      },
      // Field with transformation
      {
        id: 'transformationRow',
        RowWrapper: SecondaryRowWrapper,
        columns: [
          {
            id: 'formattedNumber',
            type: 'text' as const,
            label: 'Formatted Number',
            placeholder: 'Enter a number',
            transform: numberTransformation,
            validation: {
              pattern: '^[0-9,]+$',
              message: 'Please enter a valid number',
            },
          },
        ],
      },
      // Dynamic array field
      {
        id: 'dynamicArrayRow',
        RowWrapper: SecondaryRowWrapper,
        columns: [
          {
            id: 'dynamicArrayField',
            type: 'array' as const,
            label: 'Dynamic Array Field',
            minItems: 1,
            maxItems: 5,
            template: (index: number) => ({
              id: `dynamicItem-${index}`,
              type: 'text' as const,
              label: `Item ${index + 1}`,
              placeholder: `Enter item ${index + 1}`,
              validation: {
                custom: (value: string) => {
                  if (index === 0 && !value.startsWith('Item')) {
                    return 'First item must start with "Item"';
                  }
                  return true;
                },
              },
            }),
          },
        ],
      },
    ],
  };

  const formMethods = useFormBuilder(enhancedConfig, {
    submitDebounce: 500,
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: (response) => {
      console.log('Form submitted successfully:', response.data);

      // Update form state to reflect successful submission
      formMethods.setFormState((prev) => ({
        ...prev,
        isSubmitted: true,
        isSubmitSuccessful: true,
        isSubmitting: false,
      }));

      // Reset the form after successful submission
      formMethods.resetForm();

      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    },
  });
  const handleSubmit = (data: FormValues) => {
    // Set loading state and mark form as submitted
    setIsSubmitting(true);
    formMethods.setLoading(true);

    // Explicitly mark the form as submitted
    formMethods.setFormState((prev) => ({
      ...prev,
      isSubmitted: true,
      submitCount: prev.submitCount + 1,
    }));

    // Apply any external loading states to specific fields
    for (const [fieldId, isLoading] of Object.entries(loadingFields)) {
      if (isLoading) {
        formMethods.setFieldLoading(fieldId as keyof FormValues, true);
      }
    }

    // Simulate API delay
    setTimeout(() => {
      // Ensure all arrays are initialized
      const formData = {
        ...data,
        skills: data.skills || [],
        emails: data.emails || [''],
        addresses: data.addresses || [''],
      };

      mutation.mutate(formData);

      // Note: We don't reset loading state here because it will be reset
      // in the mutation callbacks
    }, 1500);
  };

  // Update loading state when mutation state changes or external loading changes
  useEffect(() => {
    // Combine internal and external loading states
    const isLoading = isSubmitting || externalLoading;
    formMethods.setLoading(isLoading);

    // Apply loading states to specific fields
    if (isLoading) {
      // Apply loading to specific fields based on internal state or external control
      const fieldsToLoad = isSubmitting
        ? ['phone', 'country', 'state'] // Default fields to show loading during submission
        : [];

      // Apply loading to fields from internal state
      for (const fieldId of fieldsToLoad) {
        formMethods.setFieldLoading(fieldId as keyof FormValues, true);
      }

      // Apply any external loading states to specific fields
      for (const [fieldId, isFieldLoading] of Object.entries(loadingFields)) {
        formMethods.setFieldLoading(fieldId as keyof FormValues, isFieldLoading);
      }
    } else {
      // Reset all field loading states
      for (const fieldId of ['phone', 'country', 'state']) {
        formMethods.setFieldLoading(fieldId as keyof FormValues, false);
      }

      // Also reset any fields that might have been set from external loading
      for (const fieldId of Object.keys(loadingFields)) {
        formMethods.setFieldLoading(fieldId as keyof FormValues, false);
      }
    }
  }, [isSubmitting, externalLoading, loadingFields, formMethods]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <FormProvider formMethods={formMethods}>
          <ErrorBoundary
            fallback={
              <div className="p-4 bg-red-100 text-red-800 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Something went wrong with the form</h2>
                <p>Please try refreshing the page or contact support if the issue persists.</p>
              </div>
            }
            onError={(error) => {
              console.error('Form error:', error);
            }}
          >
            <EnhancedFormBuilder
              config={config}
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
            />

            {mutation.isSuccess && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                Form submitted successfully!
              </div>
            )}

            {mutation.isError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                An error occurred while submitting the form.
              </div>
            )}

            <FormControls />
            <FeatureDemonstration />
            <ArrayFieldControls />
            <FormStateDisplay />
          </ErrorBoundary>
        </FormProvider>
      </div>
    </div>
  );
};

// Example component that demonstrates a more realistic form submission with staged loading
const _StagedSubmissionDemo = () => {
  const [stagedLoading, setStagedLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});

  // Define the stages of form submission
  const stages = [
    { name: 'Validating personal info', fields: ['phone', 'ssn'] },
    { name: 'Checking address', fields: ['country', 'state'] },
    { name: 'Verifying credentials', fields: ['password', 'confirmPassword'] },
    { name: 'Processing skills', fields: ['skills'] },
  ];

  const handleStagedSubmission = () => {
    // Start the staged submission process
    setStagedLoading(true);
    setCurrentStage(0);

    // Process each stage with a delay
    const processStages = (stageIndex: number) => {
      if (stageIndex >= stages.length) {
        // All stages complete
        setStagedLoading(false);
        setLoadingFields({});
        setCurrentStage(0);
        return;
      }

      // Set the current stage
      setCurrentStage(stageIndex);

      // Set loading for the current stage's fields
      const stageFields = stages[stageIndex].fields;
      const newLoadingFields: Record<string, boolean> = {};

      for (const field of stageFields) {
        newLoadingFields[field] = true;
      }

      setLoadingFields(newLoadingFields);

      // Process the next stage after a delay
      setTimeout(() => {
        processStages(stageIndex + 1);
      }, 1500);
    };

    // Start processing stages
    processStages(0);
  };

  return (
    <div className="mb-4 p-4 bg-green-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Staged Form Submission Demo</h2>
      <p className="mb-4 text-sm text-green-800">
        This demo shows how to control loading states for different fields during a multi-stage form
        submission process.
      </p>

      {stagedLoading && (
        <div className="mb-4 p-3 bg-green-100 rounded">
          <p className="font-medium text-green-800">
            Stage {currentStage + 1}/{stages.length}: {stages[currentStage].name}
          </p>
          <div className="w-full bg-green-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleStagedSubmission}
        disabled={stagedLoading}
        className={`px-4 py-2 rounded text-white ${
          stagedLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {stagedLoading ? 'Processing...' : 'Start Staged Submission'}
      </button>

      {stagedLoading && (
        <div className="mt-3">
          <p className="text-sm text-green-800">
            Loading fields: {Object.keys(loadingFields).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// Component to demonstrate the new features
const FeatureDemonstration = () => {
  const { resetField, watch, shouldDisplayField, transformField, getFieldDependencies } =
    useFormContext();

  const showAdvanced = watch('showAdvanced');
  const formattedNumber = watch('formattedNumber');
  const advancedField = watch('advancedField');
  const dynamicArrayField = watch('dynamicArrayField');

  // Get dependencies for the advancedField
  const advancedFieldDeps = getFieldDependencies('advancedField');

  // Check if advancedField should be displayed
  const isAdvancedFieldVisible = shouldDisplayField('advancedField');

  // Transform a value manually
  const rawNumber = transformField('formattedNumber', formattedNumber, 'input');

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">New Features Demonstration</h2>

      <div className="space-y-6">
        {/* Field-Level Reset */}
        <div>
          <h3 className="text-lg font-medium mb-2">Field-Level Reset:</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => resetField('formattedNumber')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Reset Formatted Number
            </button>
            <button
              type="button"
              onClick={() => resetField('dynamicArrayField')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Reset Dynamic Array
            </button>
          </div>
        </div>

        {/* Field Transformation */}
        <div>
          <h3 className="text-lg font-medium mb-2">Field Transformation:</h3>
          <div className="p-3 bg-gray-50 rounded">
            <p>
              <strong>Formatted Number Display Value:</strong> {String(formattedNumber)}
            </p>
            <p>
              <strong>Raw Number Value (stored):</strong> {String(rawNumber)}
            </p>
          </div>
        </div>

        {/* Conditional Fields */}
        <div>
          <h3 className="text-lg font-medium mb-2">Conditional Fields:</h3>
          <div className="p-3 bg-gray-50 rounded">
            <p>
              <strong>Show Advanced:</strong> {showAdvanced ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Advanced Field Visible:</strong> {isAdvancedFieldVisible ? 'Yes' : 'No'}
            </p>
            {isAdvancedFieldVisible && (
              <p>
                <strong>Advanced Field Value:</strong> {String(advancedField) || '(empty)'}
              </p>
            )}
          </div>
        </div>

        {/* Field Dependencies */}
        <div>
          <h3 className="text-lg font-medium mb-2">Field Dependencies:</h3>
          <div className="p-3 bg-gray-50 rounded">
            <p>
              <strong>Fields that depend on 'showAdvanced':</strong>
            </p>
            <ul className="list-disc pl-5">
              {advancedFieldDeps.map((dep) => (
                <li key={dep as string}>{dep as string}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dynamic Array Templates */}
        <div>
          <h3 className="text-lg font-medium mb-2">Dynamic Array Templates:</h3>
          <div className="p-3 bg-gray-50 rounded">
            <p>
              <strong>Dynamic Array Items:</strong>
            </p>
            <ul className="list-disc pl-5">
              {Array.isArray(dynamicArrayField) &&
                dynamicArrayField.map((item, index) => (
                  <li key={item}>
                    Item {index + 1}: {item}
                    {index === 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (First item must start with "Item")
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // Example of controlling loading state externally
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalLoadingFields, setExternalLoadingFields] = useState<Record<string, boolean>>({});

  // Example functions to demonstrate external loading control
  const handleExternalLoadingDemo = () => {
    // Set specific fields to loading
    setExternalLoadingFields({
      ssn: true,
      password: true,
    });

    // Simulate an external process
    setTimeout(() => {
      // Clear loading after 3 seconds
      setExternalLoadingFields({});
    }, 3000);
  };

  const handleAllFieldsLoadingDemo = () => {
    // Set global loading state
    setExternalLoading(true);

    // Simulate an external process
    setTimeout(() => {
      // Clear loading after 3 seconds
      setExternalLoading(false);
    }, 3000);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">External Loading Control Demo</h2>
          <p className="mb-4 text-sm text-blue-800">
            These controls demonstrate how to control loading states from outside the form
            component. This is useful when you need to show loading skeletons during form submission
            or when fetching data.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExternalLoadingDemo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set SSN & Password Fields Loading (3s)
            </button>
            <button
              type="button"
              onClick={handleAllFieldsLoadingDemo}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Set All Fields Loading (3s)
            </button>
          </div>
        </div>

        <FormWithQuery externalLoading={externalLoading} loadingFields={externalLoadingFields} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
