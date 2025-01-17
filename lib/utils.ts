import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { eachDayOfInterval, isSameDay } from 'date-fns';

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

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) return previous === current ? 0 : 100;

  return ((current - previous) / previous) * 100;
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: Number;
    expenses: Number;
  }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) {
    return [];
  }

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));

    if (found) {
      return found;
    } else {
      return {
        date: day,
        income: 0,
        expenses: 0,
      };
    }
  });

  return transactionByDay;
}
