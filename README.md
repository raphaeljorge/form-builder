# React Dynamic Form Builder

A flexible and type-safe form builder for React applications with built-in TypeScript support.

## Installation

```bash
npm install react-dynamic-form-builder
```

## Usage

```tsx
import { FormBuilder, useFormState } from 'react-dynamic-form-builder';
import type { FormConfig } from 'react-dynamic-form-builder';

const formConfig: FormConfig = {
  rows: [
    {
      id: 'row1',
      columns: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter first name',
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter last name',
        },
      ],
    },
    {
      id: 'row2',
      columns: [
        {
          id: 'country',
          type: 'select',
          label: 'Country',
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

function App() {
  const { state, onChange } = useFormState(formConfig);

  return (
    <FormBuilder
      config={formConfig}
      state={state}
      onChange={onChange}
    />
  );
}
```

## Features

- Type-safe form configuration
- Built-in form state management
- Customizable field components
- Responsive grid layout
- TailwindCSS styling

## License

MIT