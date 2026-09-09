import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCommitment(value: string): string {
  if (!value) return '';
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}

interface ParseIntOptions {
  min?: number;
  max?: number;
  fallback?: number;
}

/**
 * Parses a string as an integer and clamps it to [min, max].
 * Returns `fallback` when the input is not a number, so invalid or empty
 * values can never produce NaN that silently corrupts claim data.
 */
export function parseBoundedInt(value: string, options: ParseIntOptions = {}): number {
  const { min, max, fallback = 0 } = options;
  let parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) return fallback;
  if (min !== undefined && parsed < min) parsed = min;
  if (max !== undefined && parsed > max) parsed = max;
  return parsed;
}
