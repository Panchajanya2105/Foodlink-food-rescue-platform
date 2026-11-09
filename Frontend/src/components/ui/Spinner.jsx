import React from 'react';
import { cn } from '../../utils/cn.js';

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-forest-600 border-t-transparent',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
export default Spinner;
