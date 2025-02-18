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
          id: 'skills',
          type: 'chip',
          label: 'Skills',
          placeholder: 'Type to search skills...',
          required: true,
          options: [
            'JavaScript',
            'TypeScript',
            'React',
            'Node.js',
            'Python',
            'Java',
            'C++',
            'Ruby',
            'Go',
            'Rust',
            'SQL',
            'MongoDB',
            'Redis',
            'Docker',
            'Kubernetes',
            'AWS',
            'Azure',
            'GCP'
          ],
          minItems: 2,
          maxItems: 5,
          validation: {
            message: 'Please select between 2 and 5 skills'
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
      id: 'row5',
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