import React, { memo, useMemo } from 'react';
import { EnhancedFormBuilder } from './components/EnhancedFormBuilder';
import { formConfig } from './config/formConfig';
import type { RowWrapperProps, FormValues } from './types/form';
import { FormProvider, useFormContext } from 'react-hook-form';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { submitFormData } from './services/api';
import { useFormBuilder, UseFormBuilderReturn } from './hooks/useFormBuilder';

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
    RowWrapper: index === 0 ? PrimaryRowWrapper : SecondaryRowWrapper
  }))
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
    addresses: ['']
  };
  
  return defaultValues;
};

const ArrayFieldControls = () => {
  const methods = useFormContext() as UseFormBuilderReturn;
  const { arrayFields, setValue, getValues } = methods;

  const handleAddEmail = () => {
    const currentEmails = (getValues('emails') || []) as string[];
    setValue('emails', [...currentEmails, ''], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const handleAddAddress = () => {
    const currentAddresses = (getValues('addresses') || []) as string[];
    setValue('addresses', [...currentAddresses, ''], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const handleRemoveEmail = (index: number) => {
    const currentEmails = (getValues('emails') || []) as string[];
    setValue('emails', currentEmails.filter((_: string, i: number) => i !== index), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const handleRemoveAddress = (index: number) => {
    const currentAddresses = (getValues('addresses') || []) as string[];
    setValue('addresses', currentAddresses.filter((_: string, i: number) => i !== index), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
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
  const methods = useFormContext() as UseFormBuilderReturn;
  const { resetForm, setFieldFocus, validateField, getFieldState } = methods;

  // Example of field state tracking
  const phoneState = getFieldState('phone');
  const ssnState = getFieldState('ssn');
  const countryState = getFieldState('country');

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
      keepDirty: true
    }
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

        {/* Field State Display */}
        <div>
          <h3 className="text-lg font-medium mb-2">Field States:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Phone Field:</h4>
              <div className="space-y-1 text-sm">
                <p>Touched: {phoneState.isTouched ? 'Yes' : 'No'}</p>
                <p>Dirty: {phoneState.isDirty ? 'Yes' : 'No'}</p>
                <p>Error: {phoneState.error ? phoneState.error.message : 'None'}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">SSN Field:</h4>
              <div className="space-y-1 text-sm">
                <p>Touched: {ssnState.isTouched ? 'Yes' : 'No'}</p>
                <p>Dirty: {ssnState.isDirty ? 'Yes' : 'No'}</p>
                <p>Error: {ssnState.error ? ssnState.error.message : 'None'}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Country Field:</h4>
              <div className="space-y-1 text-sm">
                <p>Touched: {countryState.isTouched ? 'Yes' : 'No'}</p>
                <p>Dirty: {countryState.isDirty ? 'Yes' : 'No'}</p>
                <p>Error: {countryState.error ? countryState.error.message : 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormStateDisplay = () => {
  const methods = useFormContext() as UseFormBuilderReturn;
  const { state, formState } = methods;
  const { raw, masked } = state;

  // Track form state
  const {
    isDirty = false,
    isValid = false,
    isSubmitting = false,
    isSubmitSuccessful = false,
    isSubmitted = false,
    isValidating = false,
    submitCount = 0,
    errors = {},
    dirtyFields = {}
  } = formState;

  return (
    <div className="mt-8 space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Form Values:</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Quick Access Values:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <p><strong>Phone:</strong></p>
              <p>Raw: {raw.phone}</p>
              <p>Masked: {masked.phone}</p>
              <p className="mt-2 text-sm text-gray-600">
                Changed: {dirtyFields.phone ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <p><strong>Country:</strong> {raw.country}</p>
              <p className="mt-2 text-sm text-gray-600">
                Changed: {dirtyFields.country ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Masked Values:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(masked, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Raw Values:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(raw, null, 2)}
            </pre>
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

const FormWithQuery = () => {
  // Memoize default values
  const defaultValues = useMemo(() => getDefaultValues(), []);

  const methods = useFormBuilder(config, {
    mode: 'onChange',
    reValidateMode: 'onBlur',
    criteriaMode: 'all',
    shouldFocusError: true,
    defaultValues
  });

  // Initialize array fields if empty
  React.useEffect(() => {
    const { emails, addresses } = methods.getValues();
    
    if (!emails || emails.length === 0) {
      methods.setValue('emails', [''], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }
    
    if (!addresses || addresses.length === 0) {
      methods.setValue('addresses', [''], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }
  }, [methods]);

  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: (response) => {
      console.log('Form submitted successfully:', response.data);
      methods.reset();
    },
    onError: (error: Error) => {
      try {
        const errors = JSON.parse(error.message) as Record<string, string>;
        Object.entries(errors).forEach(([key, message]) => {
          // Check if key exists in FormValues type
          const validFields = ['phone', 'ssn', 'country', 'emails', 'addresses', 'skills'] as const;
          type ValidField = typeof validFields[number];
          
          if (validFields.includes(key as ValidField)) {
            methods.setError(key as ValidField, { message });
          }
        });
      } catch {
        console.error('Error submitting form:', error);
        // Set a generic error message
        methods.setError('root', {
          type: 'submitError',
          message: 'Failed to submit form. Please try again.'
        });
      }
    }
  });

  const handleSubmit = (data: FormValues) => {
    // Ensure all arrays are initialized
    const formData = {
      ...data,
      skills: data.skills || [],
      emails: data.emails || [''],
      addresses: data.addresses || ['']
    };
    mutation.mutate(formData);
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">          
          <EnhancedFormBuilder
            config={config}
            onSubmit={handleSubmit}
          />

          {mutation.isSuccess && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
              Form submitted successfully!
            </div>
          )}

          {mutation.isError && !methods.formState.errors && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              An error occurred while submitting the form.
            </div>
          )}

          <FormControls />
          <ArrayFieldControls />
          <FormStateDisplay />
        </div>
      </div>
    </FormProvider>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormWithQuery />
    </QueryClientProvider>
  );
};