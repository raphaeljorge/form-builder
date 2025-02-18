# Enhanced Form Builder

A flexible and performant form builder library with support for various field types, validation, and dynamic form layouts.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Field Types](#field-types)
- [Form Configuration](#form-configuration)
- [Validation](#validation)
- [Components](#components)
- [Examples](#examples)
- [API Reference](#api-reference)

## Installation

```bash
npm install @your-org/form-builder
```

## Quick Start

```tsx
import { EnhancedFormBuilder } from './components/form';
import { FormProvider } from 'react-hook-form';
import { useFormBuilder } from './hooks/useFormBuilder';

const formConfig = {
  rows: [
    {
      id: 'row1',
      columns: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          required: true
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          validation: {
            pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            message: 'Please enter a valid email'
          }
        }
      ]
    }
  ]
};

const MyForm = () => {
  const methods = useFormBuilder(formConfig, {
    mode: 'onChange'
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <EnhancedFormBuilder
        config={formConfig}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
};
```

## Field Types

### Text Field
```tsx
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
}
```

### Select Field
```tsx
{
  id: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ],
  validation: {
    custom: (value) => value === 'us' || 'Currently only accepting US applications'
  }
}
```

### Chip Field (with Autocomplete)
```tsx
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
    'Python'
  ],
  minItems: 2,
  maxItems: 5,
  validation: {
    message: 'Please select between 2 and 5 skills'
  }
}
```

### Array Field
```tsx
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
```

## Form Configuration

### Row Configuration
```tsx
{
  rows: [
    {
      id: 'row1',
      wrapperProps: {
        className: 'bg-gray-50 p-4'
      },
      columns: [
        // field configs
      ]
    }
  ]
}
```

### Custom Row Wrapper
```tsx
const CustomRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`custom-row ${className}`}>
    {children}
  </div>
));

// Usage
<EnhancedFormBuilder
  config={formConfig}
  onSubmit={onSubmit}
  RowWrapper={CustomRowWrapper}
/>
```

## Validation

### Basic Validation
```tsx
{
  required: true,
  validation: {
    pattern: '^[A-Z][a-z]*$',
    message: 'Must start with capital letter'
  }
}
```

### Custom Validation
```tsx
{
  validation: {
    custom: (value) => {
      if (value.length < 3) return 'Must be at least 3 characters';
      return true;
    }
  }
}
```

### Cross-field Validation
```tsx
{
  validation: {
    deps: ['password'],
    custom: (value, formValues) => {
      return value === formValues.password || 'Passwords must match';
    }
  }
}
```

## Components

### Form Provider Setup
```tsx
const methods = useFormBuilder(config, {
  mode: 'onChange',
  reValidateMode: 'onBlur',
  criteriaMode: 'all',
  shouldFocusError: true,
  defaultValues: {
    name: '',
    email: '',
    skills: []
  }
});

return (
  <FormProvider {...methods}>
    <EnhancedFormBuilder
      config={config}
      onSubmit={handleSubmit}
    />
  </FormProvider>
);
```

### Form State Management
```tsx
const { state, formState } = methods;
const { raw, masked } = state;
const { 
  isDirty,
  isValid,
  isSubmitting,
  errors
} = formState;
```

### Array Field Operations
```tsx
const { arrayFields } = methods;

// Add item
arrayFields.emails?.append('');

// Remove item
arrayFields.emails?.remove(0);

// Move item
arrayFields.emails?.move(0, 1);
```

## Examples

### Complete Form Example
```tsx
const formConfig = {
  rows: [
    {
      id: 'personal',
      columns: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
          validation: {
            pattern: '^[A-Za-z\\s]{2,}$',
            message: 'Please enter a valid name'
          }
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          required: true,
          validation: {
            pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            message: 'Please enter a valid email'
          }
        }
      ]
    },
    {
      id: 'skills',
      columns: [
        {
          id: 'technologies',
          type: 'chip',
          label: 'Technologies',
          required: true,
          options: ['React', 'Vue', 'Angular', 'Node.js'],
          minItems: 1,
          maxItems: 3
        }
      ]
    },
    {
      id: 'contacts',
      columns: [
        {
          id: 'phoneNumbers',
          type: 'array',
          label: 'Phone Numbers',
          minItems: 1,
          template: {
            id: 'phone',
            type: 'text',
            mask: '(###) ###-####',
            validation: {
              pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
              message: 'Invalid phone number'
            }
          }
        }
      ]
    }
  ]
};

const MyForm = () => {
  const methods = useFormBuilder(formConfig, {
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      technologies: [],
      phoneNumbers: ['']
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await submitToAPI(data);
      methods.reset();
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <EnhancedFormBuilder
        config={formConfig}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
};
```

## API Reference

### useFormBuilder Options
```typescript
interface UseFormBuilderOptions {
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
  reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
  defaultValues?: Partial<FormValues>;
  shouldUnregister?: boolean;
  criteriaMode?: 'firstError' | 'all';
  shouldFocusError?: boolean;
}
```

### Field Configuration
```typescript
interface BaseFieldConfig {
  id: string;
  type: 'text' | 'select' | 'array' | 'chip';
  label?: string;
  placeholder?: string;
  mask?: string;
  required?: boolean;
  validation?: ValidationConfig;
  shouldUnregister?: boolean;
  defaultValue?: any;
}

interface ValidationConfig {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: string) => boolean | string;
  required?: boolean;
  deps?: string[];
  message?: string;
}
```

### Form State
```typescript
interface FormState {
  raw: FormValues;
  masked: Record<string, string | any[]>;
}

interface EnhancedFormState {
  isDirty: boolean;
  dirtyFields: Record<string, boolean>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  touchedFields: Record<string, boolean>;
  errors: Record<string, FieldError>;
  isValid: boolean;
}
```

For more detailed information about specific components or features, please refer to the source code or create an issue in the repository.