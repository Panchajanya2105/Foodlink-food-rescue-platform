import React from 'react';
import { cn } from '../../utils/cn.js';

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-red-50 text-red-700 border-red-200/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  neutral: 'bg-stone-100 text-stone-700 border-stone-200/80',
  forest: 'bg-forest-50 text-forest-700 border-forest-200/80',
};

const dotColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-stone-400',
  forest: 'bg-forest-500',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variantClasses[variant] || variantClasses.neutral,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || dotColors.neutral)} />}
      {children}
    </span>
  );
}

