import { act, renderHook } from '@testing-library/react-hooks';
import { useFormBuilder } from '../hooks/useFormBuilder';
import type { FormConfig } from '../types/form';

// Mock form config for testing
const mockConfig: FormConfig = {
  rows: [
    {
      id: 'row1',
      columns: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          validation: {
            pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            message: 'Please enter a valid email address',
          },
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
            { value: 'ca', label: 'Canada' },
            { value: 'mx', label: 'Mexico' },
          ],
        },
        {
          id: 'skills',
          type: 'chip',
          label: 'Skills',
          options: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
          minItems: 2,
        },
      ],
    },
    {
      id: 'row3',
      columns: [
        {
          id: 'password',
          type: 'text',
          label: 'Password',
          required: true,
        },
        {
          id: 'confirmPassword',
          type: 'text',
          label: 'Confirm Password',
          required: true,
        },
      ],
    },
  ],
};

describe('useFormBuilder', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    expect(result.current.state.raw).toEqual(
      expect.objectContaining({
        phone: '',
        ssn: '',
        country: '',
        state: '',
        password: '',
        confirmPassword: '',
        skills: [],
      })
    );
  });

  it('should initialize with provided default values', () => {
    const defaultValues = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const { result } = renderHook(() => useFormBuilder(mockConfig, { defaultValues }));

    expect(result.current.state.raw).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
      })
    );
  });

  it('should update form values when setValue is called', () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    act(() => {
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.state.raw.name).toBe('John Doe');
    expect(result.current.formState.dirtyFields.name).toBe(true);
  });

  it('should validate required fields', async () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    await act(async () => {
      await result.current.validateField('name', '');
    });

    expect(result.current.formState.errors.name).toBeDefined();
    expect(result.current.formState.errors.name?.message).toBe('This field is required');
  });

  it('should validate email format', async () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    await act(async () => {
      await result.current.validateField('email', 'invalid-email');
    });

    expect(result.current.formState.errors.email).toBeDefined();
    expect(result.current.formState.errors.email?.message).toBe(
      'Please enter a valid email address'
    );

    await act(async () => {
      await result.current.validateField('email', 'valid@example.com');
    });

    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it('should validate password confirmation', async () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    act(() => {
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password456');
    });

    await act(async () => {
      await result.current.validateField('confirmPassword');
    });

    expect(result.current.formState.errors.confirmPassword).toBeDefined();
    expect(result.current.formState.errors.confirmPassword?.message).toBe('Passwords do not match');

    act(() => {
      result.current.setValue('confirmPassword', 'password123');
    });

    await act(async () => {
      await result.current.validateField('confirmPassword');
    });

    expect(result.current.formState.errors.confirmPassword).toBeUndefined();
  });

  it('should validate minimum items for chip fields', async () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    await act(async () => {
      await result.current.validateField('skills', ['JavaScript']);
    });

    expect(result.current.formState.errors.skills).toBeDefined();
    expect(result.current.formState.errors.skills?.message).toBe('Minimum 2 items required');

    await act(async () => {
      await result.current.validateField('skills', ['JavaScript', 'TypeScript']);
    });

    expect(result.current.formState.errors.skills).toBeUndefined();
  });

  it('should reset the form', () => {
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    act(() => {
      result.current.setValue('name', 'John Doe');
      result.current.setValue('email', 'john@example.com');
    });

    expect(result.current.state.raw.name).toBe('John Doe');
    expect(result.current.formState.isDirty).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.state.raw.name).toBe('');
    expect(result.current.formState.isDirty).toBe(false);
  });

  it('should handle form submission', () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useFormBuilder(mockConfig));

    // Fill in required fields
    act(() => {
      result.current.setValue('name', 'John Doe');
      result.current.setValue('password', 'password123');
      result.current.setValue('confirmPassword', 'password123');
      result.current.setValue('skills', ['JavaScript', 'TypeScript']);
    });

    // Create a mock event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Submit the form
    act(() => {
      result.current.handleSubmit(onSubmit)(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        password: 'password123',
        confirmPassword: 'password123',
        skills: ['JavaScript', 'TypeScript'],
      })
    );
    expect(result.current.formState.isSubmitted).toBe(true);
    expect(result.current.formState.isSubmitSuccessful).toBe(true);
  });
});
