import { FieldValue } from '../types/form';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const submitFormData = async (data: Record<string, FieldValue>) => {
  // Simulate API call
  await delay(1000);
  
  // Simulate API validation
  const errors: Record<string, string> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (!value.raw) {
      errors[key] = 'This field is required';
    }
    
    if (key === 'phone' && value.raw.length !== 10) {
      errors[key] = 'Phone number must be 10 digits';
    }
    
    if (key === 'ssn' && value.raw.length !== 9) {
      errors[key] = 'SSN must be 9 digits';
    }
  });
  
  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }
  
  // Simulate successful response
  return {
    success: true,
    message: 'Form submitted successfully',
    data
  };
};