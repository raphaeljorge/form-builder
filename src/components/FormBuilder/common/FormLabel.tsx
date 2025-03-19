import type React from "react";
import styles from "./FormLabel.module.css";
import { classNames } from "../../../utils/classNames";

interface FormLabelProps {
  id: string;
  label?: string;
  required?: boolean;
  hint?: string;
}

/**
 * Common form label component used across all form fields
 */
const FormLabel: React.FC<FormLabelProps> = ({ id, label, required, hint }) => {
  if (!label) return null;

  return (
    <label htmlFor={id} className={classNames(
      styles.formLabel,
      "block text-sm font-medium text-gray-700 mb-1"
    )}>
      {label}
      {required && <span className={classNames(
        styles.requiredMark,
        "text-red-500 ml-1 font-semibold"
      )}>*</span>}
      {hint && <span className={classNames(
        styles.formHint,
        "text-xs text-gray-500 ml-1"
      )}>({hint})</span>}
    </label>
  );
};

export default FormLabel;