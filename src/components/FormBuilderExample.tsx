import type React from "react";
import { FormBuilder, useFormBuilder } from "./FormBuilder";
import type { FormConfig, WrapperProps } from "../types/form";
import { useMutation } from "@tanstack/react-query";
import styles from "./FormBuilderExample.module.css";
import { classNames } from "../utils/classNames";
import { applyMask } from "../components/FormBuilder/fields/TextField";

// Define custom wrapper components
// Custom wrapper components
const CustomRowWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className={classNames("mb-8 border border-gray-200 p-4 rounded-lg")}>
    <div className={classNames("mb-2 font-semibold text-gray-700")}>
      Row: {id}
    </div>
    {children}
  </div>
);

// biome-ignore lint/correctness/noUnusedVariables: Used in FormBuilder props
// biome-ignore lint/correctness/noUnusedVariables: Used in FormBuilder props
const CustomColumnWrapper = ({ children, id }: WrapperProps) => (
  <div className={classNames("p-2")}>
    {children}
  </div>
);

// Special wrapper for important fields
const ImportantFieldWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className={classNames("p-4 border-2 border-red-500 rounded-lg bg-red-100")}>
    <div className={classNames("font-bold text-red-700 mb-2")}>
      Important Field: {id}
    </div>
    {children}
  </div>
);

// Side by side wrapper for displaying fields in a row
// biome-ignore lint/correctness/noUnusedVariables: Used in form config
// biome-ignore lint/correctness/noUnusedVariables: Used in form config
const SideBySideWrapper: React.FC<WrapperProps> = ({ children, id }) => (
  <div className={classNames(styles.sideBySideWrapper, "flex flex-row gap-4 w-full md:flex-row sm:flex-col")}>
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
          required: true,
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
            // Custom validation function
            custom: (value: string) => {
              // Example: Check if the phone number starts with a specific area code
              if (value?.startsWith("555")) {
                return "Phone numbers starting with 555 are not allowed";
              }
              return true; // Valid
            }
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
            // Cross-field validation example
            custom: (value: string, formValues: Record<string, any>) => {
              // Example: If country is US, date must be in MM/DD/YYYY format
              // If country is UK, date must be in DD/MM/YYYY format
              if (value && formValues.country === "uk") {
                // Extract month and day from MM/DD/YYYY format
                const month = Number.parseInt(value.substring(0, 2), 10);
                if (month > 12) {
                  return "For UK, date must be in DD/MM/YYYY format";
                }
              }
              return true; // Valid
            }
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
          required: true,
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
          required: true,
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
    <div className={classNames(styles.formExample, "max-w-4xl mx-auto p-8")}>
      <h1 className={classNames(styles.formTitle, "text-2xl font-bold mb-8 text-gray-800")}>Form Builder Example</h1>
      
      {/* Form Builder Component */}
      <FormBuilder
        config={exampleFormConfig}
        isLoading={mutation.isPending}
        form={form}
        RowWrapper={CustomRowWrapper}
      />
      
      {/* Form Actions - Now outside the FormBuilder component */}
      <div className={classNames(styles.formActions, "flex gap-4 mt-8 justify-end")}>
        <button
          type="button"
          onClick={resetForm}
          disabled={mutation.isPending}
          className={classNames(
            styles.resetButton,
            "px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-md text-sm font-medium",
            mutation.isPending && styles.disabled,
            mutation.isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          Reset Form
        </button>
        
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={!formState.isValid || mutation.isPending}
          className={classNames(
            styles.submitButton,
            "px-4 py-2 bg-blue-500 text-white border-none rounded-md text-sm font-medium",
            (!formState.isValid || mutation.isPending) && styles.disabled,
            (!formState.isValid || mutation.isPending) && "opacity-50 cursor-not-allowed"
          )}
        >
          {mutation.isPending ? "Submitting..." : "Submit Form"}
        </button>
      </div>
      
      <div className={classNames(styles.formDebug, "mt-12 p-6 border border-gray-200 rounded-lg bg-gray-50")}>
        <h2 className={classNames(styles.debugTitle, "text-xl font-semibold mb-4 text-gray-800")}>Form State</h2>
        <div className={classNames("flex gap-8 flex-col md:flex-row")}>
          <div className={classNames("flex-1")}>
            <h3 className={classNames(styles.debugSubtitle, "text-lg font-semibold mb-2 text-gray-700")}>Raw Values</h3>
            <pre className={classNames(styles.debugPre, "bg-gray-100 p-4 rounded-md overflow-x-auto")}>{JSON.stringify(state.raw, null, 2)}</pre>
          </div>
          <div className={classNames("flex-1")}>
            <h3 className={classNames(styles.debugSubtitle, "text-lg font-semibold mb-2 text-gray-700")}>Masked Values</h3>
            <pre className={classNames(styles.debugPre, "bg-gray-100 p-4 rounded-md overflow-x-auto")}>{JSON.stringify(state.masked, null, 2)}</pre>
          </div>
        </div>
        
        <h2 className={classNames(styles.debugTitle, "text-xl font-semibold mb-4 mt-8 text-gray-800")}>Submission State</h2>
        <p className={classNames("text-sm mb-4")}>Status: {mutation.isPending ? "Submitting..." : mutation.isSuccess ? "Success" : "Idle"}</p>
        
        <h2 className={classNames(styles.debugTitle, "text-xl font-semibold mb-4 mt-8 text-gray-800")}>Form Validity</h2>
        <p className={classNames("text-sm mb-2")}>Is Valid: {formState.isValid ? "Yes" : "No"}</p>
        <p className={classNames("text-sm mb-4")}>Is Dirty: {formState.isDirty ? "Yes" : "No"}</p>
        
        <h2 className={classNames(styles.debugTitle, "text-xl font-semibold mb-4 mt-8 text-gray-800")}>Form Errors</h2>
        <pre className={classNames(styles.debugPre, "bg-gray-100 p-4 rounded-md overflow-x-auto")}>{JSON.stringify(formState.errors, null, 2)}</pre>
      </div>
    </div>
  );
};

export default FormBuilderExample;