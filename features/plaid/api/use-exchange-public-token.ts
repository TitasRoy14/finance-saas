import { useMutation, useQueryClient } from '@tanstack/react-query';
import {InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/hono';
type ResponseType = InferResponseType<
  (typeof client.api.plaid)['exchange-public-token']['$post']>;
type RequestType = InferRequestType<
  (typeof client.api.plaid)['exchange-public-token']['$post']>['json'];

export const useExchangePublicToken = () => {
  const queryClient  = useQueryClient();
  const mutation = useMutation<ResponseType, Error,RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.plaid['exchange-public-token'].$post({json});
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Public Token Exchanged');
      queryClient.invalidateQueries({queryKey:['connected-bank']})
      queryClient.invalidateQueries({queryKey:['summmary']})
      queryClient.invalidateQueries({queryKey:['transactions']})
      queryClient.invalidateQueries({queryKey:['accounts']})
      queryClient.invalidateQueries({queryKey:['account']})
      queryClient.invalidateQueries({queryKey:['categories']})
      queryClient.invalidateQueries({queryKey:['category']})
    },
    onError: () => {
      toast.error('Failed to exchange public token');
    },
  });

  return mutation;
};
