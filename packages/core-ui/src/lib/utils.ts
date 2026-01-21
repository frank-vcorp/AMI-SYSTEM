/**
 * Utility functions for core-ui
 * @package @ami/core-ui
 * FIX REFERENCE: FIX-20260121-01
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
