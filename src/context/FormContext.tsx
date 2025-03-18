import type React from 'react';
import { type ReactNode, createContext, useContext } from 'react';
import { type UseFormBuilderReturn, useFormBuilder } from '../hooks/useFormBuilder';
import type { FormConfig, FormValues } from '../types/form';

// Create a context for the form
const FormContext = createContext<UseFormBuilderReturn | null>(null);

// Provider props
interface FormProviderProps {
  children: ReactNode;
  formMethods: UseFormBuilderReturn;
}

// Provider component
export const FormProvider: React.FC<FormProviderProps> = ({ children, formMethods }) => {
  return <FormContext.Provider value={formMethods}>{children}</FormContext.Provider>;
};

// Hook to use the form context
export const useFormContext = (): UseFormBuilderReturn => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context;
};

// Helper function to create a form instance
export const createFormInstance = (
  config: FormConfig,
  defaultValues?: Partial<FormValues>
): UseFormBuilderReturn => {
  return useFormBuilder(config, { defaultValues });
};
