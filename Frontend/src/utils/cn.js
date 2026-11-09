/**
 * Simple class names helper joining valid classes.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

