import type { FormConfig } from '../types/form';

export const formConfig: FormConfig = {
  rows: [
    {
      id: 'row1',
      wrapperProps: {
        className: 'mb-4'
      },
      columns: [
        {
          id: 'phone',
          type: 'text',
          label: 'Phone',
          placeholder: '(999) 999-9999',
          mask: '(###) ###-####',
          required: true,
          validation: {
            pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
            message: 'Please enter a valid phone number'
          }
        },
        {
          id: 'ssn',
          type: 'text',
          label: 'SSN',
          placeholder: '999-99-9999',
          mask: '###-##-####',
          required: true,
          validation: {
            pattern: '^\\d{3}-\\d{2}-\\d{4}$',
            message: 'Please enter a valid SSN'
          }
        }
      ],
    },
    {
      id: 'row2',
      wrapperProps: {
        className: 'mb-4'
      },
      columns: [
        {
          id: 'country',
          type: 'select',
          label: 'Country',
          required: true,
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
          ],
          validation: {
            custom: (value) => {
              // Example of custom validation
              return value === 'us' || 'Currently only accepting US applications';
            }
          }
        },
      ],
    },
    {
      id: 'row3',
      wrapperProps: {
        className: 'mb-4'
      },
      columns: [
        {
          id: 'emails',
          type: 'array',
          label: 'Email Addresses',
          required: true,
          minItems: 1,
          maxItems: 3,
          template: {
            id: 'email',
            type: 'text',
            placeholder: 'Enter email',
            validation: {
              pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
              message: 'Please enter a valid email'
            }
          }
        }
      ]
    },
    {
      id: 'row4',
      wrapperProps: {
        className: 'mb-4'
      },
      columns: [
        {
          id: 'addresses',
          type: 'array',
          label: 'Addresses',
          minItems: 1,
          maxItems: 2,
          template: {
            id: 'address',
            type: 'text',
            placeholder: 'Enter address',
            validation: {
              custom: (value) => {
                return value.length >= 10 || 'Address must be at least 10 characters';
              }
            }
          }
        }
      ]
    }
  ],
};