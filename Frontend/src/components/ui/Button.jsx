import React from 'react';
import { cn } from '../../utils/cn.js';

const variantClasses = {
  primary: 'bg-forest-600 hover:bg-forest-700 text-white shadow-sm focus-visible:ring-forest-500',
  secondary: 'bg-cream-200 hover:bg-cream-300 text-stone-800 border border-cream-300 focus-visible:ring-cream-400',
  outline: 'border border-forest-600 text-forest-700 hover:bg-forest-50 focus-visible:ring-forest-500',
  ghost: 'text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500',
  warm: 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-sm focus-visible:ring-terracotta-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl',
};

export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    type = 'button',
    icon: Icon,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

