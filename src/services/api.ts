import type { FormValues } from '../types/form';

interface ApiResponse {
  success: boolean;
  message: string;
  data: FormValues;
}

export const submitFormData = async (data: FormValues): Promise<ApiResponse> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate successful response
  return {
    success: true,
    message: 'Form submitted successfully',
    data: {
      ...data,
      // Ensure all array fields are initialized
      skills: data.skills || [],
      emails: data.emails || [''],
      addresses: data.addresses || [''],
    },
  };
};
