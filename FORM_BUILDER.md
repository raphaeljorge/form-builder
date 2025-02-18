# Enhanced Form Builder Documentation

A powerful form builder that combines configuration-based form creation with react-hook-form's features and automatic input masking.

## Features

- Configuration-based form creation
- Built-in input masking
- Real-time form validation
- Form state tracking
- Type-safe implementation
- React Query integration
- Advanced form controls

## Installation

```bash
npm install react-hook-form @hookform/resolvers zod @tanstack/react-query
```

## Basic Usage

```typescript
import { useFormBuilder } from './hooks/useFormBuilder';
import { EnhancedFormBuilder } from './components/EnhancedFormBuilder';

// Define your form configuration
const config = {
  rows: [
    {
      id: 'row1',
      columns: [
        {
          id: 'phone',
          type: 'text',
          label: 'Phone',
          mask: '(###) ###-####',
          required: true,
          validation: {
            pattern: '^\\d{10}$'
          }
        }
      ]
    }
  ]
};

// Use the form builder
const MyForm = () => {
  const methods = useFormBuilder(config, {
    mode: 'onChange'
  });

  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <EnhancedFormBuilder
        config={config}
        onSubmit={handleSubmit}
      />
    </FormProvider>
  );
};
```

## Form Configuration

### Field Types

1. Text Field:
```typescript
{
  id: 'phone',
  type: 'text',
  label: 'Phone Number',
  placeholder: '(999) 999-9999',
  mask: '(###) ###-####',
  required: true,
  validation: {
    min: 10,
    max: 10,
    pattern: '^\\d{10}$',
    custom: (value) => value.startsWith('1') || 'Must start with 1'
  }
}
```

2. Select Field:
```typescript
{
  id: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]
}
```

## Form Builder Options

```typescript
const methods = useFormBuilder(config, {
  // When to trigger validation
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all',
  
  // When to re-validate
  reValidateMode: 'onChange' | 'onBlur' | 'onSubmit',
  
  // Initial form values
  defaultValues: {
    phone: '',
    country: ''
  },
  
  // Remove field values when unmounted
  shouldUnregister: boolean
});
```

## Form State

### Accessing Form State

```typescript
const { state, formState } = methods;

// Raw and masked values
console.log(state.raw);     // { phone: "1234567890" }
console.log(state.masked);  // { phone: "(123) 456-7890" }

// Form status
console.log(formState.isDirty);      // Form changed
console.log(formState.isValid);      // All validations pass
console.log(formState.isSubmitting); // Form submitting
console.log(formState.errors);       // Validation errors
```

### Watching Values

```typescript
const { watch } = methods;

// Watch raw values
watch('phone');  // "1234567890"

// Watch masked values
watch.masked('phone');  // "(123) 456-7890"

// Watch multiple fields
watch.masked(['phone', 'ssn']);
```

## Form Methods

```typescript
const {
  // Reset form to default values
  reset: () => void,
  
  // Set field value
  setValue: (name: string, value: any, options?: SetValueOptions) => void,
  
  // Get current values
  getValues: () => FormValues,
  
  // Trigger validation
  trigger: (name?: string | string[]) => Promise<boolean>,
  
  // Set error manually
  setError: (name: string, error: FieldError) => void,
  
  // Clear form errors
  clearErrors: (name?: string | string[]) => void
} = methods;
```

## Validation

### Field-level Validation

```typescript
{
  id: 'phone',
  type: 'text',
  required: true,
  validation: {
    min: 10,
    max: 10,
    pattern: '^\\d{10}$',
    custom: (value) => {
      return value.startsWith('1') || 'Must start with 1';
    }
  }
}
```

### Form-level Validation

The form builder automatically creates a Zod schema based on your field configurations, handling:
- Required fields
- Min/max length
- Pattern matching
- Custom validation
- Mask validation

## Error Handling

```typescript
// Access errors
const { formState: { errors } } = methods;

// Set errors manually
methods.setError('phone', {
  type: 'manual',
  message: 'Invalid phone number'
});

// Clear errors
methods.clearErrors('phone');
```

## React Query Integration

```typescript
const mutation = useMutation({
  mutationFn: submitFormData,
  onSuccess: (data) => {
    console.log('Success:', data);
    methods.reset();
  },
  onError: (error) => {
    // Handle API errors
    const errors = JSON.parse(error.message);
    Object.entries(errors).forEach(([key, message]) => {
      methods.setError(key, { message });
    });
  }
});
```

## Best Practices

1. Form Configuration:
   - Use meaningful field IDs
   - Provide clear labels and placeholders
   - Define appropriate validation rules
   - Group related fields in rows

2. Validation:
   - Use appropriate validation modes
   - Implement field-level validation
   - Handle API validation errors
   - Provide clear error messages

3. Performance:
   - Use appropriate revalidation modes
   - Implement debouncing where needed
   - Watch only necessary fields
   - Use shouldUnregister appropriately

4. Error Handling:
   - Handle API errors properly
   - Display validation errors clearly
   - Clear errors appropriately
   - Provide user feedback

## TypeScript Support

The form builder is fully typed, providing:
- Type-safe form configuration
- Type-safe form values
- Type-safe validation
- Type-safe error handling

## Examples

Check `src/App.tsx` for a complete example showing:
- Form configuration
- Validation setup
- Error handling
- Form state display
- React Query integration
- Real-time updates
- Form state tracking