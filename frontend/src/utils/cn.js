import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes intelligently.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * 
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-indigo-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
