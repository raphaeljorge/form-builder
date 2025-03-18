import React, { memo } from 'react';

interface FormActionsProps {
  onReset: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

export const FormActions = memo<FormActionsProps>(({ onReset, isSubmitting, isDirty }) => {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <button
        type="button"
        onClick={onReset}
        disabled={isSubmitting || !isDirty}
        className={`px-4 py-2 rounded-md ${
          isDirty
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Reset
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 rounded-md ${
          isSubmitting
            ? 'bg-blue-300 text-white cursor-wait'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
});

FormActions.displayName = 'FormActions';
