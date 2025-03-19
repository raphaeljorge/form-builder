import type React from "react";
import { FormBuilder, useFormBuilder } from "./FormBuilder";
import type { FormConfig } from "../types/form";
import "./FormBuilderExample.css";

// Example form configuration
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
      id: "preferences",
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
        },
      ],
    },
  ],
};

/**
 * Example component demonstrating FormBuilder usage
 */
const FormBuilderExample: React.FC = () => {
  // Create a single form instance with default values
  const form = useFormBuilder(exampleFormConfig, {
    defaultValues: {
      name: "",
      email: "",
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

  const onSubmit = (data: Record<string, any>) => {
    console.log("Form submitted with data:", data);
    alert(`Form submitted successfully!\n\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="form-example">
      <h1>Form Builder Example</h1>
      
      <FormBuilder
        config={exampleFormConfig}
        form={form}
      >
        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            className="reset-button"
          >
            Reset Form
          </button>
          
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!formState.isValid}
            className="submit-button"
          >
            Submit Form
          </button>
        </div>
      </FormBuilder>
      
      <div className="form-debug">
        <h2>Form State</h2>
        <pre>{JSON.stringify(state.raw, null, 2)}</pre>
        
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