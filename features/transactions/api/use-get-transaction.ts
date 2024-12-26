import { useQuery } from '@tanstack/react-query';
import { convertMilliunitsToAmounts } from '@/lib/utils';

import { client } from '@/lib/hono';

export const useGetTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['transactions', { id }],
    queryFn: async () => {
      const response = await client.api.transactions[':id'].$get({
        param: { id },
      });

      if (!response.ok) throw new Error('Falied to fetch transaction');

      const { data } = await response.json();

      const transResponse = Object.assign({}, data, {
        ...data,
        amount: convertMilliunitsToAmounts(data.amount),
      });

      return transResponse;
    },
  });

  return query;
};
