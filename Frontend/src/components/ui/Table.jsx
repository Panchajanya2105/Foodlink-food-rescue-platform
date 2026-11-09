import React from 'react';
import { cn } from '../../utils/cn.js';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80 bg-white">
      <table className={cn('w-full text-left border-collapse text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return <thead className={cn('bg-cream-50/80 border-b border-stone-200 text-stone-600', className)}>{children}</thead>;
}

export function TableRow({ children, className = '', hover = true }) {
  return (
    <tr
      className={cn(
        'border-b border-stone-100 last:border-0 transition-colors',
        hover && 'hover:bg-cream-50/40',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={cn('px-4 py-3.5 text-xs font-bold text-stone-700 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={cn('divide-y divide-stone-100', className)}>{children}</tbody>;
}

export function TableCell({ children, className = '' }) {
  return <td className={cn('px-4 py-3.5 text-stone-800 align-middle', className)}>{children}</td>;
}

