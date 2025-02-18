import React, { memo } from 'react';
import { EnhancedFormBuilder } from './components/EnhancedFormBuilder';
import { formConfig } from './config/formConfig';
import type { RowWrapperProps, FormValues } from './types/form';
import { FormProvider } from 'react-hook-form';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { submitFormData } from './services/api';
import { useFormBuilder } from './hooks/useFormBuilder';

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

const FormStateDisplay = () => {
  const { state } = useFormBuilder(config);
  const { raw, masked } = state;

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Form State:</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Quick Access Values:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded">
            <p><strong>Phone:</strong></p>
            <p>Raw: {raw.phone}</p>
            <p>Masked: {masked.phone}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p><strong>Country:</strong> {raw.country}</p>
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
  );
};

const FormWithQuery = () => {
  const methods = useFormBuilder(config);

  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: (data) => {
      console.log('Success:', data);
      methods.reset();
    },
    onError: (error: Error) => {
      try {
        const errors = JSON.parse(error.message);
        Object.entries(errors).forEach(([key, message]) => {
          methods.setError(key as keyof FormValues, { message: message as string });
        });
      } catch {
        console.error('Error:', error);
      }
    }
  });

  const handleSubmit = (data: FormValues) => {
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