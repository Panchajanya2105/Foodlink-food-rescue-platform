import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-stone-200/80 shadow-subtle p-6 transition-all duration-200',
        hover && 'hover:shadow-card hover:-translate-y-0.5 hover:border-forest-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('flex flex-col gap-1 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={cn('text-lg font-bold text-stone-900 tracking-tight', className)} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-sm text-stone-500', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-stone-100 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

