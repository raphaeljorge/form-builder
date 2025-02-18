import React, { memo } from 'react';
import { EnhancedFormBuilder } from './components/EnhancedFormBuilder';
import { formConfig } from './config/formConfig';
import type { RowWrapperProps, FieldValue } from './types/form';
import { useForm, useWatch, FormProvider, useFormContext } from 'react-hook-form';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { submitFormData, transformFormDataToApi } from './services/api';

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

type FormState = Record<string, FieldValue>;

const FormStateDisplay = () => {
  const { control } = useFormContext();
  const formValues = useWatch({ control });

  if (!formValues) return null;

  const maskedValues: Record<string, string> = {};
  const rawValues: Record<string, string> = {};

  Object.entries(formValues).forEach(([key, value]) => {
    if (value && typeof value === 'object' && 'masked' in value && 'raw' in value) {
      maskedValues[key] = value.masked;
      rawValues[key] = value.raw;
    }
  });

  const apiFormat = transformFormDataToApi(formValues);
  const hasValues = Object.values(apiFormat).some(value => value !== '');

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Form State:</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Quick Access Values:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded">
            <p><strong>Phone:</strong></p>
            <p>Raw: {formValues.phone?.raw || ''}</p>
            <p>Masked: {formValues.phone?.masked || ''}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p><strong>Country:</strong> {formValues.country?.raw || ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Masked Values:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(maskedValues, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Raw Values:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(rawValues, null, 2)}
          </pre>
        </div>
      </div>

      {hasValues && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">API Format:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(apiFormat, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const FormWithQuery = () => {
  const methods = useForm<FormState>({
    defaultValues: {
      phone: { masked: '', raw: '' },
      ssn: { masked: '', raw: '' },
      country: { masked: '', raw: '' }
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormState) => submitFormData(transformFormDataToApi(data)),
    onSuccess: (data) => {
      console.log('Success:', data);
      methods.reset();
    },
    onError: (error: Error) => {
      try {
        const errors = JSON.parse(error.message);
        Object.entries(errors).forEach(([key, message]) => {
          methods.setError(key as any, { message: message as string });
        });
      } catch {
        console.error('Error:', error);
      }
    }
  });

  const handleSubmit = (data: FormState) => {
    mutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Enhanced Form Builder with React Query
          </h1>
          
          <EnhancedFormBuilder
            config={config}
            onSubmit={handleSubmit}
            defaultValues={methods.getValues()}
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
}