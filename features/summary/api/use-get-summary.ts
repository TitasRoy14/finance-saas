import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { client } from '@/lib/hono';
import { convertMilliunitsToAmounts } from '@/lib/utils';

export const useGetSummary = () => {
  const params = useSearchParams();
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const accountId = params.get('accountId') || '';

  const query = useQuery({
    queryKey: ['summary', { from, to, accountId }],
    queryFn: async () => {
      const response = await client.api.summary.$get({
        query: {
          from,
          to,
          accountId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const { data } = await response.json();
      return {
        ...data,
        incomeAmount: convertMilliunitsToAmounts(data.incomeAmount),
        expensesAmount: convertMilliunitsToAmounts(data.expensesAmount),
        remainingAmount: convertMilliunitsToAmounts(data.remainingAmount),
        categories: data.categories.map(
          (category: { name: string; value: number }) => ({
            ...category,
            value: convertMilliunitsToAmounts(category.value),
          })
        ),
        days: data.days.map(
          (day: { date: Date; income: number; expenses: number }) => ({
            ...day,
            income: convertMilliunitsToAmounts(day.income),
            expenses: convertMilliunitsToAmounts(day.expenses),
          })
        ),
      };
    },
  });

  return query;
};
