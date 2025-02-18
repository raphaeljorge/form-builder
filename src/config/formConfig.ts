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
            pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$'
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
            pattern: '^\\d{3}-\\d{2}-\\d{4}$'
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
        },
      ],
    },
  ],
};