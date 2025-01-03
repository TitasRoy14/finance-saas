import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertMilliunitsToAmounts(amount: number): number {
  return amount / 1000;
}
export function convertAmountToMilliunits(amount: number): number {
  return Math.round(amount * 1000);
}

export function formatCurrency(amount: number): string {
  // const finalValue = convertMilliunitsToAmounts(amount);
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
