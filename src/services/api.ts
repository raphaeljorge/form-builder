import { FieldValue } from '../types/form';

// Define the API expected format
interface ApiFormData {
  country: string;
  phone: string;
  ssn: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const submitFormData = async (data: ApiFormData) => {
  // Simulate API call
  await delay(1000);
  
  // Simulate API validation
  const errors: Record<string, string> = {};
  
  if (!data.phone) {
    errors.phone = 'Phone is required';
  } else if (data.phone.length !== 10) {
    errors.phone = 'Phone number must be 10 digits';
  }
  
  if (!data.ssn) {
    errors.ssn = 'SSN is required';
  } else if (data.ssn.length !== 9) {
    errors.ssn = 'SSN must be 9 digits';
  }
  
  if (!data.country) {
    errors.country = 'Country is required';
  }
  
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

// Helper to transform form data to API format
export const transformFormDataToApi = (formData: Record<string, FieldValue> | null | undefined): ApiFormData => {
  if (!formData) {
    return {
      country: '',
      phone: '',
      ssn: ''
    };
  }

  return {
    country: formData.country?.raw || '',
    phone: formData.phone?.raw || '',
    ssn: formData.ssn?.raw || ''
  };
};