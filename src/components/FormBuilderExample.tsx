import type React from "react";
import { FormBuilder, useFormBuilder } from "./FormBuilder";
import type { FormConfig, WrapperProps } from "../types/form";
import { useMutation } from "@tanstack/react-query";
import "./FormBuilderExample.css";
import { applyMask } from "../components/FormBuilder/fields/TextField";

// Define custom wrapper components
// Custom wrapper components
const CustomRowWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className="custom-form-row" style={{ marginBottom: '2rem', border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem' }}>
    <div className="row-header" style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
      Row: {id}
    </div>
    {children}
  </div>
);

// biome-ignore lint/correctness/noUnusedVariables: Used in FormBuilder props
const CustomColumnWrapper = ({ children, id }: WrapperProps) => (
  <div className="custom-form-column" style={{ padding: '0.5rem' }}>
    {children}
  </div>
);

// Special wrapper for important fields
const ImportantFieldWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className="important-field-wrapper" style={{
    padding: '1rem',
    border: '2px solid #ef4444',
    borderRadius: '0.5rem',
    backgroundColor: '#fee2e2'
  }}>
    <div style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>
      Important Field: {id}
    </div>
    {children}
  </div>
);

// Side by side wrapper for displaying fields in a row
// biome-ignore lint/correctness/noUnusedVariables: Used in form config
const SideBySideWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className="side-by-side-wrapper" style={{
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    width: '100%'
  }}>
    {children}
  </div>
);


// Example form configuration with wrapper references
const exampleFormConfig: FormConfig = {
  rows: [
    {
      id: "personalInfo",
      columns: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          required: true,
          wrapper: ImportantFieldWrapper,
        },
        {
          id: "email",
          type: "text",
          label: "Email Address",
          validation: {
            pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
            message: "Please enter a valid email address",
          },
        },
      ],
    },
    {
      id: "maskedFields",
      columns: [
        {
          id: "phone",
          type: "text",
          label: "Phone Number",
          placeholder: "(123) 456-7890",
          mask: "(###) ###-####", // Mask for phone number
          validation: {
            pattern: "^\\d{10}$", // Validate 10 digits
            message: "Phone number must be 10 digits",
          },
        },
        {
          id: "ssn",
          type: "text",
          label: "Social Security Number",
          placeholder: "123-45-6789",
          mask: "###-##-####", // Mask for SSN
          validation: {
            pattern: "^\\d{9}$", // Validate 9 digits
            message: "SSN must be 9 digits",
          },
        },
      ],
    },
    {
      id: "moreMaskedFields",
      wrapper: SideBySideWrapper, // Use the SideBySideWrapper to display fields side by side
      columns: [
        {
          id: "creditCard",
          type: "text",
          label: "Credit Card",
          placeholder: "1234 5678 9012 3456",
          mask: "#### #### #### ####", // Mask for credit card
          validation: {
            pattern: "^\\d{16}$", // Validate 16 digits
            message: "Credit card must be 16 digits",
          },
          wrapper: ImportantFieldWrapper,
        },
        {
          id: "date",
          type: "text",
          label: "Date",
          placeholder: "MM/DD/YYYY",
          mask: "##/##/####", // Mask for date
          validation: {
            pattern: "^\\d{8}$", // Validate 8 digits
            message: "Date must be in MM/DD/YYYY format",
          },
        },
      ],
    },
    {
      id: "preferences",
      wrapper: SideBySideWrapper, // Use the SideBySideWrapper to display fields side by side
      columns: [
        {
          id: "country",
          type: "select",
          label: "Country",
          options: [
            { value: "us", label: "United States" },
            { value: "ca", label: "Canada" },
            { value: "mx", label: "Mexico" },
            { value: "uk", label: "United Kingdom" },
            { value: "fr", label: "France" },
            { value: "de", label: "Germany" },
          ],
        },
        {
          id: "interests",
          type: "chip",
          label: "Interests",
          options: [
            "Technology",
            "Sports",
            "Music",
            "Art",
            "Travel",
            "Food",
            "Fashion",
            "Science",
          ],
          minItems: 2,
          maxItems: 5,
        },
      ],
    },
    {
      id: "contactInfo",
      columns: [
        {
          id: "phoneNumbers",
          type: "array",
          label: "Phone Numbers",
          minItems: 1,
          maxItems: 3,
          template: {
            type: "text",
            placeholder: "Enter phone number",
          },
          wrapper: ImportantFieldWrapper, // Use the ImportantFieldWrapper directly
        },
      ],
    },
  ],
};

/**
 * Simulate an API call to submit form data
 */
const submitFormData = async (data: Record<string, any>): Promise<Record<string, any>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Simulate API response
  return {
    success: true,
    message: "Form submitted successfully",
    data,
  };
};

/**
 * Example component demonstrating FormBuilder usage
 */
const FormBuilderExample: React.FC = () => {
  // Create React Query mutation
  const mutation = useMutation({
    mutationFn: submitFormData,
  });

  // Create a single form instance with default values
  const form = useFormBuilder(exampleFormConfig, {
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ssn: "",
      creditCard: "",
      date: "",
      country: "",
      interests: [],
      phoneNumbers: [""],
    },
    // Add mode option to validate on change
    mode: "onChange",
  });

  // Destructure form methods and state
  const {
    state,
    formState,
    handleSubmit,
    resetForm,
    // Remove unused variable
  } = form;

  // Handle form submission with React Query
  const onSubmit = async (data: Record<string, any>) => {
    try {
      // Submit form data using mutation
      await mutation.mutateAsync(data);
      
      // Show success message
      console.log("Form submitted with data:", data);
      alert(`Form submitted successfully!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Form submission failed:", error);
      alert("Form submission failed. Please try again.");
    }
  };



  return (
    <div className="form-example">
      <h1>Form Builder Example</h1>
      
      {/* Form Builder Component */}
      <FormBuilder
        config={exampleFormConfig}
        isLoading={mutation.isPending}
        form={form}
        RowWrapper={CustomRowWrapper}
      />
      
      {/* Form Actions - Now outside the FormBuilder component */}
      <div className="form-actions">
        <button
          type="button"
          onClick={resetForm}
          disabled={mutation.isPending}
          className="reset-button"
        >
          Reset Form
        </button>
        
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={!formState.isValid || mutation.isPending}
          className="submit-button"
        >
          {mutation.isPending ? "Submitting..." : "Submit Form"}
        </button>
      </div>
      
      <div className="form-debug">
        <h2>Form State</h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Raw Values</h3>
            <pre>{JSON.stringify(state.raw, null, 2)}</pre>
          </div>
          <div style={{ flex: 1 }}>
            <h3>Masked Values</h3>
            <pre>{JSON.stringify(state.masked, null, 2)}</pre>
          </div>
        </div>
        
        <h2>Submission State</h2>
        <p>Status: {mutation.isPending ? "Submitting..." : mutation.isSuccess ? "Success" : "Idle"}</p>
        
        <h2>Form Validity</h2>
        <p>Is Valid: {formState.isValid ? "Yes" : "No"}</p>
        <p>Is Dirty: {formState.isDirty ? "Yes" : "No"}</p>
        
        <h2>Form Errors</h2>
        <pre>{JSON.stringify(formState.errors, null, 2)}</pre>
      </div>
    </div>
  );
};

export default FormBuilderExample;