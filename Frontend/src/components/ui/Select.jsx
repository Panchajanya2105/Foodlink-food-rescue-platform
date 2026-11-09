import React from 'react';
import { cn } from '../../utils/cn.js';

export const Select = React.forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-stone-700 tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 hover:border-stone-400 focus:border-forest-600 focus:ring-forest-100',
          props.disabled && 'bg-stone-50 cursor-not-allowed text-stone-400',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-stone-500">{helperText}</p>}
    </div>
  );
});

