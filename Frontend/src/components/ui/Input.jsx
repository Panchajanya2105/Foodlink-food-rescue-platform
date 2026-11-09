import React from 'react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-stone-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-stone-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
            Icon ? 'pl-10' : 'pl-3.5',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-stone-300 hover:border-stone-400 focus:border-forest-600 focus:ring-forest-100',
            props.disabled && 'bg-stone-50 cursor-not-allowed text-stone-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-stone-500">{helperText}</p>}
    </div>
  );
});

