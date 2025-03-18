import React, { memo } from 'react';
import type { RowWrapperProps } from '../../types/form';

export const DefaultRowWrapper = memo<RowWrapperProps>(({ children, className = '' }) => (
  <div className={`flex flex-wrap gap-4 mb-4 ${className}`}>{children}</div>
));

DefaultRowWrapper.displayName = 'DefaultRowWrapper';
