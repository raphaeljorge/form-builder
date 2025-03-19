# Form Builder

A flexible and performant form builder library designed for simplicity, flexibility, and complete control over form rendering and submission.

## Core Design Philosophy

The Form Builder follows a minimalist, single-responsibility approach:

1. **Single Import Requirements**: Only the main component needs to be imported for basic usage.
2. **Self-Contained Provider**: The FormProvider is handled internally within the component.
3. **Unified Access**: All form state, methods, and utilities are accessible through a single custom hook.
4. **Separation of Concerns**: 
   - The component focuses solely on rendering form fields based on configuration
   - Action buttons are completely separate from the component
   - The form hook provides methods that can be used anywhere in the application

## Architecture Overview

### Component Structure

The Form Builder consists of three primary architectural elements:

1. **Main Rendering Component**: Responsible only for displaying form fields based on configuration.
   - Internally manages the TanStack Form Provider
   - Renders rows, columns, and fields according to configuration
   - Does not manage form state or submission logic
   - Focuses solely on field rendering

2. **Form Configuration System**: A declarative JSON structure that defines:
   - Form layout (rows and columns)
   - Field types and properties
   - Validation rules
   - UI customization options

3. **Unified Form Hook**: A single custom hook built on top of @tanstack/react-form that provides complete access to:
   - Form state (validity, errors, dirty state)
   - Form values (raw and masked)
   - Form methods (reset, submit, validate)
   - Array field operations (add, remove, move items)

### Data Flow

1. Configuration is passed to both the hook and component
2. Hook initializes form state and methods
3. Component renders fields based on configuration
4. External components receive form state and methods from the hook
5. External components handle submission and other actions

## Form Configuration

### Structure

The form configuration follows a hierarchical structure:

- **Form**: Contains an array of rows
  - **Rows**: Horizontal groupings that contain columns
    - **Columns**: Vertical sections that contain field configurations
      - **Fields**: Individual input elements with their configuration

Here's an example of a basic form configuration:

```json
{
  "rows": [
    {
      "id": "personalInfo",
      "columns": [
        {
          "id": "nameCol",
          "fieldConfig": {
            "id": "name",
            "type": "text",
            "label": "Full Name",
            "required": true
          }
        },
        {
          "id": "emailCol",
          "fieldConfig": {
            "id": "email",
            "type": "text",
            "label": "Email Address",
            "required": true,
            "validation": {
              "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
              "message": "Please enter a valid email address"
            }
          }
        }
      ]
    }
  ]
}
```

### Configuration Properties

#### Row Configuration
- `id`: Unique identifier
- `wrapperProps`: Optional HTML attributes for the row container
- `columns`: Array of column configurations

#### Column Configuration
- `id`: Unique identifier
- `wrapperProps`: Optional HTML attributes for the column container
- `fieldConfig`: Configuration for the field in this column

#### Common Field Properties
- `id`: Unique identifier used as the field name
- `type`: Field type (text, select, array, chip)
- `label`: Display label
- `placeholder`: Placeholder text
- `required`: Whether the field is required
- `validation`: Validation rules
- `mask`: Input mask pattern (for text fields)
- `defaultValue`: Initial value
- `showSkeleton`: Toggle skeleton loading for individual fields (defaults to true)

#### Type-Specific Field Properties

Text Field:
- Standard properties only

Select Field:
- `options`: Array of options (can be strings or {value, label} objects)

```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "required": true,
  "options": [
    { "value": "us", "label": "United States" },
    { "value": "ca", "label": "Canada" },
    { "value": "mx", "label": "Mexico" }
  ]
}
```

Chip Field:
- `options`: Available options for selection
- `minItems`: Minimum number of selections
- `maxItems`: Maximum number of selections

Array Field:
- `template`: Field configuration for each item
- `minItems`: Minimum number of items
- `maxItems`: Maximum number of items

```json
{
  "id": "contacts",
  "type": "array",
  "label": "Contact Information",
  "minItems": 1,
  "maxItems": 3,
  "template": {
    "type": "text",
    "placeholder": "Enter phone number",
    "validation": {
      "pattern": "^\\(\\d{3}\\) \\d{3}-\\d{4}$",
      "message": "Please enter a valid phone number format: (XXX) XXX-XXXX"
    }
  }
}
```

## Validation Behavior

### Validation System

The Form Builder uses TanStack Form's powerful validation system, providing:

1. **Field-level Validation**
   - Immediate validation as users type
   - Validation on blur
   - Customizable validation triggers
   - Synchronous and asynchronous validators

2. **Cross-field Validation**
   - Dependencies between fields
   - Form-wide validation rules
   - Conditional validation based on other field values

3. **Validation Triggers**
   - Fields with default values are validated immediately
   - Empty fields are validated on interaction
   - All fields are validated on submission
   - Custom validation timing is configurable

### Validation Configuration

```jsx
// Field-level validation examples using TanStack Form patterns
{
  id: "email",
  type: "text",
  label: "Email Address",
  validation: {
    required: { value: true, message: "Email is required" },
    validate: "email",
    message: "Please enter a valid email address"
  }
}

// Number validation
{
  id: "age",
  type: "text",
  label: "Age",
  validation: {
    min: { value: 18, message: "Must be at least 18" },
    max: { value: 100, message: "Must be at most 100" },
    validate: "number"
  }
}

// Custom validation function
{
  id: "username",
  type: "text",
  label: "Username",
  validation: {
    custom: {
      validator: (value) => {
        // Returns true if valid, string error message if invalid
        return value.length >= 3 || "Username must be at least 3 characters";
      }
    }
  }
}

// Asynchronous validation
{
  id: "username",
  type: "text",
  label: "Username",
  validation: {
    async: {
      validator: async (value) => {
        // Check username availability
        const result = await checkUsernameAvailability(value);
        return result.isAvailable || "Username is already taken";
      },
      // Debounce time in milliseconds
      debounce: 500
    }
  }
}

// Cross-field validation
{
  id: "passwordConfirm",
  type: "text",
  label: "Confirm Password",
  validation: {
    dependencies: ["password"],
    custom: {
      validator: (value, formValues) => {
        return value === formValues.password || "Passwords must match";
      }
    }
  }
}
```

### Default Value Validation

Fields with default values follow special validation rules:

1. Default values are validated on form initialization
2. If a default value is invalid, the error state is shown immediately
3. This ensures data integrity by alerting users to problematic default values

### Complex Validation Example

```jsx
const formConfig = {
  rows: [
    {
      id: "paymentRow",
      columns: [
        {
          id: "cardCol",
          fieldConfig: {
            id: "cardNumber",
            type: "text",
            label: "Credit Card Number",
            validation: {
              required: { value: true, message: "Card number required" },
              custom: {
                validator: (value) => {
                  // Luhn algorithm for credit card validation
                  return validateCreditCard(value) || "Invalid card number";
                }
              }
            }
          }
        },
        {
          id: "expiryCol",
          fieldConfig: {
            id: "expiryDate",
            type: "text",
            label: "Expiry Date",
            validation: {
              required: { value: true, message: "Expiry date required" },
              custom: {
                validator: (value) => {
                  // Check if date is in future
                  const isValid = isDateInFuture(value);
                  return isValid || "Card has expired";
                }
              }
            }
          }
        }
      ]
    }
  ]
};
```

## Unified Form Hook

### Purpose

The unified form hook (`useFormBuilder`) serves as the central access point for all form functionality, eliminating the need to manage multiple hooks or providers. It's built on top of @tanstack/react-form to provide a comprehensive API.

### Features

1. **Form State Management**
   - Track form validity
   - Access error messages
   - Monitor submission state
   - Track dirty fields

2. **Value Management**
   - Access current values
   - Set/update values programmatically
   - Reset form to initial state
   - Handle masked input values

3. **Array Field Operations**
   - Add/remove items
   - Reorder items
   - Update specific items
   - Track array field state

4. **Form Actions**
   - Handle form submission
   - Trigger validation
   - Clear errors
   - Set custom errors

Example hook usage:

```jsx
const {
  // Form state
  state: { isValid, isDirty, errors },
  
  // Form values
  values,
  
  // Value operations
  setValue,
  getValue,
  reset,
  
  // Array field operations
  arrayFields: {
    add,
    remove,
    move
  },
  
  // Form actions
  handleSubmit,
  validate,
  clearErrors,
  setError
} = useFormBuilder(formConfig, {
  defaultValues: {
    name: '',
    email: ''
  }
});
```

### Integration with TanStack Form

The `useFormBuilder` hook is a thin wrapper around TanStack Form's `useForm` hook, but with added functionality specific to the Form Builder:

```jsx
// Internal implementation concept
function useFormBuilder(config, options) {
  // Initialize TanStack form
  const form = useForm({
    defaultValues: options.defaultValues,
    onSubmit: options.onSubmit
  });
  
  // Create form definition from config
  const formDefinition = useMemo(() => {
    return createFormDefinition({
      // Define fields based on config
      fields: extractFieldsFromConfig(config),
      // Define validators based on config
      validators: createValidatorsFromConfig(config)
    });
  }, [config]);
  
  // Initialize form with definition
  useEffect(() => {
    form.initialize(formDefinition);
  }, [form, formDefinition]);
  
  // Add custom array field operations
  const arrayFields = useMemo(() => {
    const operations = {};
    
    // Find array fields from config
    const arrayFieldConfigs = findArrayFieldsInConfig(config);
    
    arrayFieldConfigs.forEach(fieldConfig => {
      operations[fieldConfig.id] = {
        add: (value) => {
          const currentValues = form.getValue(fieldConfig.id) || [];
          form.setValue(fieldConfig.id, [...currentValues, value]);
        },
        remove: (index) => {
          const currentValues = form.getValue(fieldConfig.id) || [];
          form.setValue(
            fieldConfig.id,
            currentValues.filter((_, i) => i !== index)
          );
        },
        move: (from, to) => {
          const currentValues = form.getValue(fieldConfig.id) || [];
          const newValues = [...currentValues];
          const [movedItem] = newValues.splice(from, 1);
          newValues.splice(to, 0, movedItem);
          form.setValue(fieldConfig.id, newValues);
        }
      };
    });
    
    return operations;
  }, [config, form]);
  
  // Return unified API
  return {
    state: form.state,
    values: form.values,
    setValue: form.setValue,
    getValue: form.getValue,
    reset: form.reset,
    arrayFields,
    handleSubmit: (callback) => {
      return form.handleSubmit(data => {
        return callback?.(data);
      });
    },
    validate: form.validate,
    clearErrors: () => form.clearErrors(),
    setError: (name, error) => form.setError(name, error)
  };
}

## Field Types

### Text Field
A standard text input with optional masking support.

### Select Field
A dropdown selection field with single-value selection.

### Chip Field
A multi-selection field with tag/chip UI representation.

### Array Field
A repeatable field group that allows users to add multiple entries.

## Component Customization

### Custom Wrappers

The component supports custom wrappers for different structural elements:

1. **Row Wrapper**: Controls the container for a row of fields
2. **Column Wrapper**: Controls the container for individual field columns

### Styling Options

Styling can be applied through:
- className props on wrappers
- Custom wrapper components
- Direct style objects on wrapper props

## Separation of Form and Actions

### Form Rendering

The component is responsible only for rendering the form fields based on configuration.

### Action Buttons

Action buttons (submit, reset, etc.) should be:
- Created completely outside the component
- Connected to form methods from the hook
- Placed anywhere in the UI (not as children of the form)

This separation provides several benefits:
1. Greater control over button placement
2. Custom action flows
3. Integration with external state
4. Support for complex page layouts (header/body/footer, etc.)

### Example Page Layout

```
+----------------------------------------+
|              HEADER                    |
+----------------------------------------+
|                                        |
|             FormBuilder                |
|            (fields only)               |
|                                        |
+----------------------------------------+
|              FOOTER                    |
|        Submit and Reset buttons        |
+----------------------------------------+
```

In this layout, the form fields and action buttons are completely separate components, but they work together through the shared form hook.

## Usage Examples

Below are common patterns that show how to implement the Form Builder with @tanstack/react-form in various scenarios.

### Basic Registration Form with Page Layout

```jsx
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

// Configuration
const registrationConfig = {
  rows: [
    {
      id: "personalInfo",
      columns: [
        {
          id: "firstNameCol",
          fieldConfig: {
            id: "firstName",
            type: "text",
            label: "First Name",
            validation: {
              required: { value: true, message: "First name is required" }
            }
          }
        },
        {
          id: "lastNameCol",
          fieldConfig: {
            id: "lastName",
            type: "text",
            label: "Last Name",
            validation: {
              required: { value: true, message: "Last name is required" }
            }
          }
        }
      ]
    },
    {
      id: "accountInfo",
      columns: [
        {
          id: "emailCol",
          fieldConfig: {
            id: "email",
            type: "text",
            label: "Email Address",
            validation: {
              required: { value: true, message: "Email is required" },
              validate: "email",
              message: "Please enter a valid email address"
            }
          }
        },
        {
          id: "passwordCol",
          fieldConfig: {
            id: "password",
            type: "text",
            label: "Password",
            validation: {
              required: { value: true, message: "Password is required" },
              minLength: { value: 8, message: "Password must be at least 8 characters" }
            }
          }
        }
      ]
    }
  ]
};

const RegistrationPage = () => {
  const { 
    state, 
    handleSubmit, 
    reset, 
    isLoading 
  } = useFormBuilder(registrationConfig);
  
  const onSubmit = async (data) => {
    try {
      // Send data to API
      await registerUser(data);
      reset(); // Clear form on success
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  
  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1>User Registration</h1>
      </header>
      
      {/* Body - Form fields only */}
      <main className="page-body">
        <FormBuilder 
          config={registrationConfig}
          isLoading={isLoading} 
        />
      </main>
      
      {/* Footer - Action buttons */}
      <footer className="page-footer">
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => reset()}
            className="secondary-button"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={() => handleSubmit(onSubmit)}
            disabled={!state.isValid}
            className="primary-button"
          >
            Register
          </button>
        </div>
      </footer>
    </div>
  );
};
```

### Dynamic Contact List Form with Floating Action Panel

```jsx
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

const contactListConfig = {
  rows: [
    {
      id: "contactsRow",
      columns: [
        {
          id: "contactsCol",
          fieldConfig: {
            id: "contacts",
            type: "array",
            label: "Contact List",
            minItems: 1,
            maxItems: 10,
            template: {
              type: "text",
              placeholder: "Enter email address",
              validation: {
                pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                message: "Please enter a valid email address"
              }
            }
          }
        }
      ]
    }
  ]
};

const ContactListPage = () => {
  const {
    state,
    handleSubmit,
    arrayFields,
    values
  } = useFormBuilder(contactListConfig, {
    defaultValues: {
      contacts: [''] // Start with one empty contact
    }
  });
  
  const onSubmit = (data) => {
    console.log("Contact list:", data.contacts);
    // Process contact list
  };
  
  return (
    <div className="contacts-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Tools</h3>
        {/* Array field management */}
        <div className="array-controls">
          <button
            type="button"
            onClick={() => arrayFields.contacts.append('')}
            disabled={values.contacts.length >= 10}
          >
            Add Contact
          </button>
          
          {values.contacts.length > 1 && (
            <button
              type="button"
              onClick={() => arrayFields.contacts.remove(values.contacts.length - 1)}
            >
              Remove Last Contact
            </button>
          )}
        </div>
      </aside>
      
      {/* Main content */}
      <div className="main-content">
        <header>
          <h2>Manage Contact List</h2>
        </header>
        
        {/* Form fields only */}
        <FormBuilder config={contactListConfig} />
        
        {/* Floating action panel */}
        <div className="floating-panel">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!state.isValid}
          >
            Save Contact List
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Multi-Step Form in Wizard Layout

```jsx
import { useState } from 'react';
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

// Step 1: Personal Information
const personalInfoConfig = {
  rows: [
    {
      id: "nameRow",
      columns: [
        {
          id: "nameCol",
          fieldConfig: {
            id: "fullName",
            type: "text",
            label: "Full Name",
            required: true
          }
        }
      ]
    },
    {
      id: "contactRow",
      columns: [
        {
          id: "emailCol",
          fieldConfig: {
            id: "email",
            type: "text",
            label: "Email",
            required: true,
            validation: {
              pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
              message: "Please enter a valid email"
            }
          }
        },
        {
          id: "phoneCol",
          fieldConfig: {
            id: "phone",
            type: "text",
            label: "Phone Number",
            required: true
          }
        }
      ]
    }
  ]
};

// Step 2: Address Information
const addressInfoConfig = {
  rows: [
    {
      id: "addressRow",
      columns: [
        {
          id: "streetCol",
          fieldConfig: {
            id: "street",
            type: "text",
            label: "Street Address",
            required: true
          }
        }
      ]
    },
    {
      id: "cityStateRow",
      columns: [
        {
          id: "cityCol",
          fieldConfig: {
            id: "city",
            type: "text",
            label: "City",
            required: true
          }
        },
        {
          id: "stateCol",
          fieldConfig: {
            id: "state",
            type: "select",
            label: "State",
            required: true,
            options: [
              { value: "ca", label: "California" },
              { value: "ny", label: "New York" },
              { value: "tx", label: "Texas" }
              // More states...
            ]
          }
        },
        {
          id: "zipCol",
          fieldConfig: {
            id: "zipCode",
            type: "text",
            label: "ZIP Code",
            required: true
          }
        }
      ]
    }
  ]
};

const WizardFormPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  // Step 1 form
  const {
    state: personalFormState,
    handleSubmit: handlePersonalSubmit,
    getValue: getPersonalValue
  } = useFormBuilder(personalInfoConfig, {
    mode: 'onChange'
  });
  
  // Step 2 form
  const {
    state: addressFormState,
    handleSubmit: handleAddressSubmit
  } = useFormBuilder(addressInfoConfig, {
    mode: 'onChange'
  });
  
  const goToNextStep = handlePersonalSubmit((data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  });
  
  const submitFullForm = handleAddressSubmit((data) => {
    const completeData = {
      ...formData,
      ...data
    };
    
    console.log("Complete form data:", completeData);
    // Submit to API
  });
  
  return (
    <div className="wizard-container">
      {/* Wizard header */}
      <header className="wizard-header">
        <h1>Application Process</h1>
        
        <div className="progress-tracker">
          <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
            Personal Info
          </div>
          <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
            Address
          </div>
        </div>
      </header>
      
      {/* Wizard body - form fields only */}
      <main className="wizard-body">
        {currentStep === 1 && (
          <FormBuilder config={personalInfoConfig} />
        )}
        
        {currentStep === 2 && (
          <FormBuilder config={addressInfoConfig} />
        )}
      </main>
      
      {/* Wizard footer - navigation buttons */}
      <footer className="wizard-footer">
        {currentStep === 1 && (
          <div className="step-actions">
            <button
              type="button"
              onClick={goToNextStep}
              disabled={!personalFormState.isValid}
              className="next-button"
            >
              Next
            </button>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="step-actions">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="back-button"
            >
              Back
            </button>
            
            <button
              type="button"
              onClick={submitFullForm}
              disabled={!addressFormState.isValid}
              className="submit-button"
            >
              Submit
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
```

### Integration with External Systems and Complex Layout

```jsx
import { useEffect } from 'react';
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

const userProfileConfig = {
  rows: [
    {
      id: "profileRow",
      columns: [
        {
          id: "usernameCol",
          fieldConfig: {
            id: "username",
            type: "text",
            label: "Username",
            required: true
          }
        },
        {
          id: "displayNameCol",
          fieldConfig: {
            id: "displayName",
            type: "text",
            label: "Display Name",
            required: true
          }
        }
      ]
    },
    {
      id: "bioRow",
      columns: [
        {
          id: "bioCol",
          fieldConfig: {
            id: "bio",
            type: "text",
            label: "Biography",
            required: false
          }
        }
      ]
    }
  ]
};

const AppLayout = ({ userId }) => {
  // Form hook - accessible anywhere in the layout
  const {
    state,
    handleSubmit,
    setValue,
    reset
  } = useFormBuilder(userProfileConfig);
  
  // Load user data from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserData(userId);
        
        // Populate form with user data
        setValue('username', userData.username);
        setValue('displayName', userData.displayName);
        setValue('bio', userData.bio || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    if (userId) {
      loadUserData();
    }
  }, [userId, setValue]);
  
  const onSubmit = async (data) => {
    try {
      await updateUserProfile(userId, data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  return (
    <div className="app-layout">
      {/* App Header with actions */}
      <header className="app-header">
        <div className="logo">Profile Manager</div>
        
        <div className="header-actions">
          <button
            type="button"
            onClick={() => reset()}
            disabled={!state.isDirty}
            className="cancel-button"
          >
            Cancel Changes
          </button>
          
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!state.isDirty || !state.isValid}
            className="save-button"
          >
            Save Changes
          </button>
        </div>
      </header>
      
      {/* Sidebar */}
      <aside className="app-sidebar">
        <nav>
          <ul>
            <li>Dashboard</li>
            <li className="active">Profile</li>
            <li>Settings</li>
          </ul>
        </nav>
        
        {/* Form status indicator */}
        <div className="form-status">
          {state.isDirty && <span className="status unsaved">Unsaved Changes</span>}
          {!state.isValid && <span className="status error">Validation Errors</span>}
        </div>
      </aside>
      
      {/* Main content - form fields only */}
      <main className="app-content">
        <h2>Edit Profile</h2>
        
        <FormBuilder config={userProfileConfig} />
      </main>
      
      {/* App footer */}
      <footer className="app-footer">
        <div className="footer-info">Last updated: {new Date().toLocaleDateString()}</div>
        
        {/* Duplicate save buttons in footer */}
        <div className="footer-actions">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!state.isDirty || !state.isValid}
          >
            Save Changes
          </button>
        </div>
      </footer>
    </div>
  );
};
```

### Dashboard with Multiple Forms

```jsx
import { useState } from 'react';
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

// First form config - Account Settings
const accountSettingsConfig = {
  rows: [
    {
      id: "emailRow",
      columns: [
        {
          id: "emailCol",
          fieldConfig: {
            id: "email",
            type: "text",
            label: "Email Address",
            required: true
          }
        }
      ]
    },
    {
      id: "passwordRow",
      columns: [
        {
          id: "passwordCol",
          fieldConfig: {
            id: "password",
            type: "text",
            label: "New Password",
            required: false
          }
        }
      ]
    }
  ]
};

// Second form config - Notification Preferences
const notificationSettingsConfig = {
  rows: [
    {
      id: "emailNotificationsRow",
      columns: [
        {
          id: "emailNotificationsCol",
          fieldConfig: {
            id: "emailNotifications",
            type: "select",
            label: "Email Notifications",
            required: true,
            options: [
              { value: "all", label: "All Notifications" },
              { value: "important", label: "Important Only" },
              { value: "none", label: "None" }
            ]
          }
        }
      ]
    }
  ]
};

const SettingsDashboard = () => {
  // Manage which form is currently active
  const [activeSection, setActiveSection] = useState('account');
  
  // Initialize hooks for both forms
  const accountForm = useFormBuilder(accountSettingsConfig);
  const notificationForm = useFormBuilder(notificationSettingsConfig);
  
  // Handle submissions for each form
  const saveAccountSettings = accountForm.handleSubmit((data) => {
    console.log("Account settings:", data);
    // Save account settings
  });
  
  const saveNotificationSettings = notificationForm.handleSubmit((data) => {
    console.log("Notification settings:", data);
    // Save notification settings
  });
  
  return (
    <div className="settings-dashboard">
      {/* Fixed header */}
      <header className="dashboard-header">
        <h1>User Settings</h1>
      </header>
      
      {/* Tab navigation */}
      <nav className="settings-tabs">
        <button 
          className={activeSection === 'account' ? 'active' : ''}
          onClick={() => setActiveSection('account')}
        >
          Account Settings
        </button>
        
        <button 
          className={activeSection === 'notifications' ? 'active' : ''}
          onClick={() => setActiveSection('notifications')}
        >
          Notification Preferences
        </button>
      </nav>
      
      {/* Main content - shows active form */}
      <main className="settings-content">
        {activeSection === 'account' && (
          <div className="account-settings">
            <h2>Account Settings</h2>
            <FormBuilder config={accountSettingsConfig} />
          </div>
        )}
        
        {activeSection === 'notifications' && (
          <div className="notification-settings">
            <h2>Notification Preferences</h2>
            <FormBuilder config={notificationSettingsConfig} />
          </div>
        )}
      </main>
      
      {/* Global action bar */}
      <div className="global-action-bar">
        {activeSection === 'account' && (
          <button 
            onClick={saveAccountSettings}
            disabled={!accountForm.state.isDirty || !accountForm.state.isValid}
          >
            Save Account Settings
          </button>
        )}
        
        {activeSection === 'notifications' && (
          <button 
            onClick={saveNotificationSettings}
            disabled={!notificationForm.state.isDirty || !notificationForm.state.isValid}
          >
            Save Notification Preferences
          </button>
        )}
      </div>
    </div>
  );
};
```</div>
      
      {currentStep === 1 && (
        <>
          <FormBuilder config={personalInfoConfig}>
            <div className="form-actions">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!personalFormState.isValid}
              >
                Next
              </button>
            </div>
          </FormBuilder>
        </>
      )}
      
      {currentStep === 2 && (
        <>
          <FormBuilder config={addressInfoConfig}>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={submitFullForm}
                disabled={!addressFormState.isValid}
              >
                Submit
              </button>
            </div>
          </FormBuilder>
        </>
      )}
    </div>
  );
};
```

### Form with Custom Field Validation

```jsx
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

const paymentFormConfig = {
  rows: [
    {
      id: "cardInfoRow",
      columns: [
        {
          id: "cardNumberCol",
          fieldConfig: {
            id: "cardNumber",
            type: "text",
            label: "Card Number",
            required: true,
            validation: {
              pattern: "^[0-9]{16}$",
              message: "Card number must be 16 digits"
            }
          }
        }
      ]
    },
    {
      id: "expiryRow",
      columns: [
        {
          id: "expiryMonthCol",
          fieldConfig: {
            id: "expiryMonth",
            type: "select",
            label: "Expiration Month",
            required: true,
            options: [
              { value: "01", label: "01 - January" },
              { value: "02", label: "02 - February" },
              // More months...
            ]
          }
        },
        {
          id: "expiryYearCol",
          fieldConfig: {
            id: "expiryYear",
            type: "select",
            label: "Expiration Year",
            required: true,
            options: [
              { value: "2023", label: "2023" },
              { value: "2024", label: "2024" },
              { value: "2025", label: "2025" }
              // More years...
            ],
            validation: {
              deps: ["expiryMonth"],
              custom: "(value, formValues) => {\n  const currentDate = new Date();\n  const currentYear = currentDate.getFullYear();\n  const currentMonth = currentDate.getMonth() + 1;\n  \n  const selectedYear = parseInt(value);\n  const selectedMonth = parseInt(formValues.expiryMonth);\n  \n  if (selectedYear < currentYear) {\n    return 'Card has expired';\n  }\n  \n  if (selectedYear === currentYear && selectedMonth < currentMonth) {\n    return 'Card has expired';\n  }\n  \n  return true;\n}"
            }
          }
        },
        {
          id: "cvvCol",
          fieldConfig: {
            id: "cvv",
            type: "text",
            label: "CVV",
            required: true,
            validation: {
              pattern: "^[0-9]{3,4}$",
              message: "CVV must be 3 or 4 digits"
            }
          }
        }
      ]
    }
  ]
};

const PaymentForm = () => {
  const { state, handleSubmit } = useFormBuilder(paymentFormConfig);
  
  const onSubmit = (data) => {
    console.log("Payment information:", data);
    // Process payment
  };
  
  return (
    <div className="payment-form">
      <h2>Payment Information</h2>
      
      <FormBuilder config={paymentFormConfig}>
        <div className="form-actions">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!state.isValid}
          >
            Submit Payment
          </button>
        </div>
      </FormBuilder>
    </div>
  );
};
```

### Integration with External Systems

```jsx
import { useEffect } from 'react';
import { FormBuilder, useFormBuilder } from '@your-org/form-builder';

const userProfileConfig = {
  rows: [
    {
      id: "profileRow",
      columns: [
        {
          id: "usernameCol",
          fieldConfig: {
            id: "username",
            type: "text",
            label: "Username",
            required: true
          }
        },
        {
          id: "displayNameCol",
          fieldConfig: {
            id: "displayName",
            type: "text",
            label: "Display Name",
            required: true
          }
        }
      ]
    },
    {
      id: "bioRow",
      columns: [
        {
          id: "bioCol",
          fieldConfig: {
            id: "bio",
            type: "text",
            label: "Biography",
            required: false
          }
        }
      ]
    }
  ]
};

const UserProfileForm = ({ userId }) => {
  const {
    state,
    handleSubmit,
    setValue,
    reset
  } = useFormBuilder(userProfileConfig);
  
  // Load user data from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserData(userId);
        
        // Populate form with user data
        setValue('username', userData.username);
        setValue('displayName', userData.displayName);
        setValue('bio', userData.bio || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    if (userId) {
      loadUserData();
    }
  }, [userId, setValue]);
  
  const onSubmit = async (data) => {
    try {
      await updateUserProfile(userId, data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  return (
    <div className="profile-editor">
      <h2>Edit Profile</h2>
      
      <FormBuilder config={userProfileConfig}>
        <div className="form-actions">
          <button
            type="button"
            onClick={() => reset()}
          >
            Cancel Changes
          </button>
          
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!state.isDirty || !state.isValid}
          >
            Save Changes
          </button>
        </div>
      </FormBuilder>
    </div>
  );
};
```

## API Reference

### useFormBuilder Options

The hook accepts configuration options including:
- `defaultValues`: Initial form values
- `onSubmit`: Form submission handler
- `validationBehavior`: Controls when validation occurs (onChange, onBlur, onSubmit)
- `transform`: Transform function for form values

### Form State Properties

The form state includes:
- `isDirty`: Whether any field has changed
- `isValid`: Whether all fields are valid
- `errors`: Validation errors by field
- `isSubmitted`: Whether form has been submitted
- `isSubmitting`: Whether form is currently submitting
- `isValidating`: Whether validation is in progress
- `touchedFields`: Which fields have been interacted with
- `dirtyFields`: Which fields have changed

### Array Field Operations

Array fields provide operations including:
- `add`: Add item to the array
- `remove`: Remove item at specific index
- `move`: Move item from one position to another
- `update`: Update item at specific index
- `swap`: Swap positions of two items

### Form Methods

The hook provides methods including:
- `setValue`: Update field value
- `getValue`: Get current value for a specific field
- `reset`: Reset form state
- `handleSubmit`: Process form submission
- `validate`: Manually trigger validation
- `clearErrors`: Clear validation errors
- `setError`: Set manual error