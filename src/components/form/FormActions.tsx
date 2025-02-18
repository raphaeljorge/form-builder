import React, { memo } from 'react';

interface FormActionsProps {
  onReset: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

export const FormActions = memo<FormActionsProps>(({ 
  onReset, 
  isSubmitting, 
  isDirty 
}) => (
  <div className="flex justify-end gap-4 mt-6">
    <button
      type="button"
      onClick={onReset}
      disabled={!isDirty || isSubmitting}
      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
    >
      Reset
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      Submit
    </button>
  </div>
));

FormActions.displayName = 'FormActions';